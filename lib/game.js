'use strict';
const crypto = require('crypto');
const { STATIONS, RARITIES, BY_RARITY } = require('./metro');
const { ACHIEVEMENTS } = require('./achievements');
const { hashPassword, verifyPassword } = require('./auth');

const HOUR = 3600 * 1000;
const MAX_CHARGES = 5;
const START_NAVIGOS = 0;
const START_PACKS = 2;
const PACK_SIZE = 5;
const DURATIONS = [10 * 60 * 1000, HOUR, 6 * HOUR, 12 * HOUR, 24 * HOUR];
const MAX_ACTIVE_AUCTIONS = 5;
const MIN_RAISE = 0.05;
const MAX_PRICE = 1_000_000;
const MAX_LOG = 40;

class GameError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const fail = (m, s) => { throw new GameError(m, s); };

const rarityById = Object.fromEntries(RARITIES.map((r) => [r.id, r]));
const scrapValue = (id) => rarityById[STATIONS[id].rarity].scrap;

function drawStation() {
  const total = RARITIES.reduce((s, r) => s + r.weight, 0);
  let x = (crypto.randomInt(1_000_000) / 1_000_000) * total;
  let tier = RARITIES[0];
  for (const r of RARITIES) { if ((x -= r.weight) < 0) { tier = r; break; } }
  const pool = BY_RARITY[tier.id];
  const sum = pool.reduce((a, id) => a + STATIONS[id].weight, 0);
  let y = (crypto.randomInt(1_000_000) / 1_000_000) * sum;
  for (const id of pool) { if ((y -= STATIONS[id].weight) < 0) return id; }
  return pool[pool.length - 1];
}

function createGame(store, clock = Date.now) {
  const userKey = (n) => `user:${String(n).toLowerCase()}`;
  const loadUser = async (n) => store.get(userKey(n));
  const saveUser = (u) => store.set(userKey(u.name), u);

  function refresh(u, now) {
    if (u.charges >= MAX_CHARGES) { u.charges = MAX_CHARGES; u.tickAt = now; return; }
    const n = Math.floor((now - u.tickAt) / HOUR);
    if (n > 0) {
      u.charges = Math.min(MAX_CHARGES, u.charges + n);
      u.tickAt = u.charges >= MAX_CHARGES ? now : u.tickAt + n * HOUR;
    }
  }
  const pushLog = (u, type, msg, now) => {
    u.log.unshift({ t: now, type, msg });
    u.log.length = Math.min(u.log.length, MAX_LOG);
    u.unread = (u.unread || 0) + 1;
  };
  const addCard = (u, id, n = 1) => { u.cards[id] = (u.cards[id] || 0) + n; };
  const takeCard = (u, id, n = 1) => {
    if ((u.cards[id] || 0) < n) fail("Tu n'as pas assez d'exemplaires de cette gare.");
    u.cards[id] -= n;
    if (u.cards[id] <= 0) delete u.cards[id];
  };

  function awardAchievements(u, now) {
    u.ach ||= {};
    for (const a of ACHIEVEMENTS) {
      if (!u.ach[a.id] && a.test(u.cards)) {
        u.ach[a.id] = now;
        u.navigos += a.reward;
        pushLog(u, 'ach', `Succès débloqué : ${a.desc} (+${a.reward} Navigos).`, now);
      }
    }
  }

  function view(u, now = clock()) {
    const v = { ...u };
    delete v.hash; delete v.salt;
    refresh(v, now);
    v.max = MAX_CHARGES;
    v.nextAt = v.charges >= MAX_CHARGES ? null : v.tickAt + HOUR;
    v.now = now;
    return v;
  }

  // ---------- Enchères ----------
  const loadAuctions = async () => (await store.get('auctions')) || { seq: 0, active: [] };
  const loadPrices = async () => (await store.get('prices')) || {};

  // À appeler dans le verrou.
  async function settleExpired(now) {
    const db = await loadAuctions();
    const done = db.active.filter((a) => a.endsAt <= now);
    if (!done.length) return db;
    const prices = await loadPrices();
    const users = {};
    const get = async (n) => (users[n] ||= await loadUser(n));
    for (const a of done) {
      const name = STATIONS[a.stationId].name;
      const seller = await get(a.seller);
      if (a.bid) {
        const buyer = await get(a.bid.user);
        const net = a.bid.amount;
        if (buyer) { addCard(buyer, a.stationId); awardAchievements(buyer, now); pushLog(buyer, 'win', `Enchère remportée : ${name} pour ${a.bid.amount} Navigos.`, now); }
        if (seller) {
          seller.navigos += net;
          seller.stats.earned += net;
          seller.stats.sold += 1;
          pushLog(seller, 'sold', `${name} vendue ${a.bid.amount} Navigos (+${net} Navigos).`, now);
        }
        const p = (prices[a.stationId] ||= []);
        p.push(a.bid.amount);
        if (p.length > 20) p.shift();
      } else if (seller) {
        addCard(seller, a.stationId);
        pushLog(seller, 'expired', `Enchère terminée sans enchérisseur : ${name} est de retour dans ta collection.`, now);
      }
    }
    db.active = db.active.filter((a) => a.endsAt > now);
    await Promise.all(Object.values(users).filter(Boolean).map(saveUser));
    await store.set('prices', prices);
    await store.set('auctions', db);
    return db;
  }

  async function maybeSettle(now) {
    const db = await loadAuctions();
    if (db.active.some((a) => a.endsAt <= now)) await store.lock(() => settleExpired(now));
  }

  // Exécute une mutation sous verrou après règlement des enchères échues.
  const tx = (fn) => store.lock(async () => {
    const now = clock();
    await settleExpired(now);
    return fn(now);
  });

  async function authedUser(name, now) {
    const u = await loadUser(name);
    if (!u) fail('Compte introuvable.', 401);
    refresh(u, now);
    return u;
  }

  // ---------- API ----------
  return {
    GameError,
    constants: { HOUR, PACK_SIZE, MAX_CHARGES, DURATIONS, MAX_ACTIVE_AUCTIONS, START_NAVIGOS },

    async register(name, password) {
      name = String(name || '').trim();
      if (!/^[A-Za-z0-9_-]{3,20}$/.test(name)) fail('Pseudo : 3 à 20 caractères (lettres, chiffres, _ ou -).');
      if (typeof password !== 'string' || password.length < 6 || password.length > 100) fail('Mot de passe : 6 caractères minimum.');
      const creds = await hashPassword(password);
      return store.lock(async () => {
        if (await loadUser(name)) fail('Ce pseudo est déjà pris.', 409);
        const now = clock();
        const u = {
          name, ...creds, created: now, navigos: START_NAVIGOS, cards: {}, charges: START_PACKS, tickAt: now, ach: {},
          log: [], unread: 0, stats: { opened: 0, scrapped: 0, sold: 0, bought: 0, earned: 0 },
        };
        pushLog(u, 'info', `Bienvenue ! ${START_PACKS} paquets de ${PACK_SIZE} gares t'attendent.`, now);
        await saveUser(u);
        return { user: view(u, now) };
      });
    },

    async login(name, password) {
      const u = await loadUser(String(name || '').trim());
      const ok = u && typeof password === 'string' && (await verifyPassword(password, u.salt, u.hash));
      if (!ok) fail('Pseudo ou mot de passe incorrect.', 401);
      return view(u);
    },

    async me(name) {
      await maybeSettle(clock());
      const u = await loadUser(name);
      if (!u) fail('Compte introuvable.', 401);
      return view(u);
    },

    open: (name) => tx(async (now) => {
      const u = await authedUser(name, now);
      if (u.charges < 1) fail("Pas encore de paquet disponible. Reviens dans l'heure !");
      if (u.charges >= MAX_CHARGES) u.tickAt = now;
      u.charges -= 1;
      const cards = [];
      for (let i = 0; i < PACK_SIZE; i++) {
        const id = drawStation();
        cards.push({ stationId: id, isNew: !u.cards[id] });
        addCard(u, id);
      }
      for (const c of cards) c.qty = u.cards[c.stationId];
      u.stats.opened += 1;
      const before = Object.keys(u.ach || {}).length;
      awardAchievements(u, now);
      await saveUser(u);
      return { cards, newAch: Object.keys(u.ach).length - before, user: view(u, now) };
    }),

    scrap: (name, id, qty = 1) => tx(async (now) => {
      if (!STATIONS[id]) fail('Gare inconnue.');
      qty = Math.floor(Number(qty));
      if (!(qty >= 1)) fail('Quantité invalide.');
      const u = await authedUser(name, now);
      takeCard(u, id, qty);
      const gain = scrapValue(id) * qty;
      u.navigos += gain;
      u.stats.scrapped += qty;
      await saveUser(u);
      return { gain, user: view(u, now) };
    }),

    scrapDuplicates: (name) => tx(async (now) => {
      const u = await authedUser(name, now);
      let gain = 0, count = 0;
      for (const [id, q] of Object.entries(u.cards)) {
        if (q > 1) { gain += scrapValue(id) * (q - 1); count += q - 1; u.cards[id] = 1; }
      }
      if (!count) fail("Tu n'as aucun doublon à défoncer.");
      u.navigos += gain;
      u.stats.scrapped += count;
      await saveUser(u);
      return { gain, count, user: view(u, now) };
    }),

    market: async () => {
      const now = clock();
      await maybeSettle(now);
      const db = await loadAuctions();
      const raw = await loadPrices();
      const prices = {};
      for (const [id, arr] of Object.entries(raw)) {
        prices[id] = { avg: Math.round(arr.reduce((s, x) => s + x, 0) / arr.length), count: arr.length, last: arr[arr.length - 1], min: Math.min(...arr), max: Math.max(...arr) };
      }
      return { now, auctions: db.active, prices, minRaise: MIN_RAISE, durations: DURATIONS, maxActive: MAX_ACTIVE_AUCTIONS };
    },

    createAuction: (name, id, minPrice, duration) => tx(async (now) => {
      duration = Number(duration) || 24 * HOUR;
      if (!DURATIONS.includes(duration)) fail('Durée invalide.');
      if (!STATIONS[id]) fail('Gare inconnue.');
      minPrice = Math.floor(Number(minPrice));
      if (!(minPrice >= 1) || minPrice > MAX_PRICE) fail(`Prix minimum : entre 1 et ${MAX_PRICE} Navigos.`);
      const u = await authedUser(name, now);
      const db = await loadAuctions();
      if (db.active.filter((a) => a.seller === u.name).length >= MAX_ACTIVE_AUCTIONS) fail(`Maximum ${MAX_ACTIVE_AUCTIONS} enchères en cours.`);
      takeCard(u, id);
      const a = { id: ++db.seq, stationId: id, seller: u.name, minPrice, createdAt: now, endsAt: now + duration, duration, bid: null, bidCount: 0, bidders: [] };
      db.active.push(a);
      await saveUser(u);
      await store.set('auctions', db);
      return { auction: a, user: view(u, now) };
    }),

    bid: (name, auctionId, amount) => tx(async (now) => {
      amount = Math.floor(Number(amount));
      if (!(amount >= 1)) fail('Montant invalide.');
      const db = await loadAuctions();
      const a = db.active.find((x) => x.id === Number(auctionId));
      if (!a) fail('Cette enchère est terminée ou introuvable.', 404);
      if (a.seller.toLowerCase() === name.toLowerCase()) fail('Tu ne peux pas enchérir sur ta propre gare.');
      const min = a.bid ? Math.max(a.bid.amount + 1, Math.ceil(a.bid.amount * (1 + MIN_RAISE))) : a.minPrice;
      if (amount < min) fail(`Enchère minimale : ${min} Navigos.`);
      const u = await authedUser(name, now);
      const prev = a.bid;
      const same = prev && prev.user.toLowerCase() === u.name.toLowerCase();
      const available = u.navigos + (same ? prev.amount : 0);
      if (available < amount) fail("Tu n'as pas assez de Navigos.");
      if (prev && !same) {
        const loser = await loadUser(prev.user);
        if (loser) {
          loser.navigos += prev.amount;
          pushLog(loser, 'outbid', `Surenchéri sur ${STATIONS[a.stationId].name} (${amount} Navigos). Tes ${prev.amount} Navigos te sont rendus.`, now);
          await saveUser(loser);
        }
      }
      u.navigos = available - amount;
      a.bid = { user: u.name, amount, at: now };
      a.bidCount += 1;
      a.bidders ||= [];
      if (!a.bidders.includes(u.name)) a.bidders.push(u.name);
      await saveUser(u);
      await store.set('auctions', db);
      return { auction: a, user: view(u, now) };
    }),

    cancelAuction: (name, auctionId) => tx(async (now) => {
      const db = await loadAuctions();
      const a = db.active.find((x) => x.id === Number(auctionId));
      if (!a) fail('Enchère introuvable.', 404);
      if (a.seller.toLowerCase() !== name.toLowerCase()) fail("Ce n'est pas ton enchère.", 403);
      if (a.bid) fail('Impossible d\'annuler : il y a déjà une enchère.');
      const u = await authedUser(name, now);
      addCard(u, a.stationId);
      awardAchievements(u, now);
      db.active = db.active.filter((x) => x !== a);
      await saveUser(u);
      await store.set('auctions', db);
      return { user: view(u, now) };
    }),

    markRead: async (name) => store.lock(async () => {
      const u = await loadUser(name);
      if (!u) fail('Compte introuvable.', 401);
      u.unread = 0;
      await saveUser(u);
      return view(u);
    }),
  };
}

module.exports = { createGame, GameError, drawStation };
