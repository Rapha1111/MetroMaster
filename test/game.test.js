'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MemoryStore } = require('../lib/store');
const { createGame } = require('../lib/game');
const { STATIONS } = require('../lib/metro');

const H = 3600 * 1000;
function setup() {
  let now = 1_000_000_000_000;
  const store = new MemoryStore(null);
  const game = createGame(store, () => now);
  return { game, store, advance: (ms) => { now += ms; } };
}

test('rareté selon le nombre de lignes', () => {
  assert.equal(STATIONS.chatelet.rarity, 'legendaire');
  assert.equal(STATIONS['charles-de-gaulle-etoile'].rarity, 'super-rare');
  assert.equal(STATIONS.opera.rarity, 'rare');
  assert.equal(STATIONS.bercy.rarity, 'peu-commune');
  assert.equal(STATIONS.simplon.rarity, 'commune');
});

test('une gare par heure', async () => {
  const { game, advance } = setup();
  await game.register('alice', 'secret1');
  await game.open('alice');
  await game.open('alice');
  await assert.rejects(game.open('alice'), /Pas encore/);
  advance(H - 1);
  await assert.rejects(game.open('alice'), /Pas encore/);
  advance(1);
  await game.open('alice');
  advance(3 * H);
  assert.equal((await game.me('alice')).charges, 3);
  advance(100 * H);
  assert.equal((await game.me('alice')).charges, 5);
});

test('défausse contre des Navigos', async () => {
  const { game } = setup();
  await game.register('bob', 'secret1');
  await game.open('bob');
  const before = await game.me('bob');
  const [id, q] = Object.entries(before.cards)[0];
  const r = await game.scrap('bob', id, q);
  assert.ok(r.gain > 0);
  assert.equal(r.user.navigos, before.navigos + r.gain);
  await assert.rejects(game.scrap('bob', id, 1), /pas assez/);
});

test('enchère : surenchère, remboursement, vente, prix moyen', async () => {
  const { game, store, advance } = setup();
  const bal = async (n) => (await game.me(n)).navigos;
  for (const n of ['seller', 'bidder1', 'bidder2']) { await game.register(n, 'secret1'); await game.open(n); await game.open(n); }
  for (const n of ['bidder1', 'bidder2']) { const u = await store.get(`user:${n}`); u.navigos = 100; await store.set(`user:${n}`, u); }
  const [b1, b2, bs] = [await bal('bidder1'), await bal('bidder2'), await bal('seller')];
  const id = Object.keys((await game.me('seller')).cards)[0];
  const { auction } = await game.createAuction('seller', id, 10);
  await assert.rejects(game.bid('bidder1', auction.id, 9), /minimale/);
  await assert.rejects(game.bid('seller', auction.id, 20), /propre/);
  await game.bid('bidder1', auction.id, 20);
  assert.equal(await bal('bidder1'), b1 - 20);
  await assert.rejects(game.bid('bidder2', auction.id, 20), /minimale/);
  await game.bid('bidder2', auction.id, 30);
  assert.equal(await bal('bidder1'), b1);
  advance(24 * H + 1);
  const m = await game.market();
  assert.equal(m.auctions.length, 0);
  assert.equal(m.prices[id].avg, 30);
  assert.equal(await bal('seller'), bs + 30);
  assert.ok((await game.me('bidder2')).cards[id] >= 1);
});

test('inscription : 2 paquets de 5 gares, 0 Navigo', async () => {
  const { game } = setup();
  const { user } = await game.register('newbie', 'secret1');
  assert.equal(user.navigos, 0);
  assert.equal(user.charges, 2);
  const r = await game.open('newbie');
  assert.equal(r.cards.length, 5);
});

test('succès : finir une ligne rapporte des Navigos', async () => {
  const store = new MemoryStore(null);
  const game = createGame(store, () => 1_000_000_000_000);
  await game.register('lineman', 'secret1');
  const u = await store.get('user:lineman');
  for (const id of require('../lib/metro').LINES['3bis'].routes.flat()) u.cards[id] = 1;
  await store.set('user:lineman', u);
  const r = await game.open('lineman');
  assert.equal(r.newAch, 1);
  assert.ok(r.user.ach['line-metro']);
});

test('enchère sans enchérisseur : la carte revient', async () => {
  const { game, advance } = setup();
  await game.register('carol', 'secret1');
  await game.open('carol');
  const id = Object.keys((await game.me('carol')).cards)[0];
  const n = (await game.me('carol')).cards[id];
  await game.createAuction('carol', id, 5);
  advance(25 * H);
  assert.equal((await game.me('carol')).cards[id], n);
});

test('enchères : durée au choix, 5 max, sans frais', async () => {
  const { game, store, advance } = setup();
  await game.register('dave', 'secret1'); await game.register('erin', 'secret1');
  const u = await store.get('user:dave'); u.cards = { simplon: 10 }; await store.set('user:dave', u);
  const e = await store.get('user:erin'); e.navigos = 50; await store.set('user:erin', e);
  await assert.rejects(game.createAuction('dave', 'simplon', 5, 12345), /Durée/);
  const { auction } = await game.createAuction('dave', 'simplon', 5, 10 * 60 * 1000);
  assert.equal(auction.endsAt - auction.createdAt, 600000);
  for (let i = 0; i < 4; i++) await game.createAuction('dave', 'simplon', 5, H);
  await assert.rejects(game.createAuction('dave', 'simplon', 5, H), /Maximum 5/);
  await game.bid('erin', auction.id, 20);
  advance(11 * 60 * 1000);
  assert.equal((await game.me('dave')).navigos, 20);
});

test('achat de paquet : 50 Navigos, ne touche pas au stock horaire', async () => {
  const { game, store } = setup();
  await game.register('buyer', 'secret1');
  await assert.rejects(game.buyPack('buyer'), /50 Navigos/);
  const u = await store.get('user:buyer'); u.navigos = 70; await store.set('user:buyer', u);
  const r = await game.buyPack('buyer');
  assert.equal(r.cards.length, 5);
  assert.equal(r.user.navigos, 20);
  assert.equal(r.user.charges, 2);
});

test('code secret : 500 Navigos, une seule fois par compte', async () => {
  const { game } = setup();
  await game.register('coder', 'secret1');
  await assert.rejects(game.redeem('coder', 'NOPE'), /invalide/);
  const r = await game.redeem('coder', ' iloveparis ');
  assert.equal(r.user.navigos, 500);
  await assert.rejects(game.redeem('coder', 'ILOVEPARIS'), /déjà/);
});

test('favoris et défausse multiple', async () => {
  const { game, store } = setup();
  await game.register('multi', 'secret1');
  const u = await store.get('user:multi'); u.cards = { simplon: 3, vavin: 2, alesia: 1 }; await store.set('user:multi', u);
  await game.toggleFav('multi', 'vavin');
  await assert.rejects(game.scrapMany('multi', [{ id: 'vavin', qty: 1 }]), /favori/);
  await assert.rejects(game.scrapMany('multi', [{ id: 'simplon', qty: 5 }]), /Pas assez/);
  const r = await game.scrapMany('multi', [{ id: 'simplon', qty: 2 }, { id: 'alesia', qty: 1 }]);
  assert.equal(r.gain, 15);
  assert.deepEqual(Object.keys(r.user.cards).sort(), ['simplon', 'vavin']);
  await game.toggleFav('multi', 'vavin'); // retire le favori
  assert.equal((await game.me('multi')).favs.vavin, undefined);
  await assert.rejects(game.toggleFav('multi', 'nation'), /ne possèdes pas/);
});

test('code GRANDPARIS : 5000 Navigos', async () => {
  const { game } = setup();
  await game.register('grand', 'secret1');
  assert.equal((await game.redeem('grand', 'grandparis')).user.navigos, 5000);
});

test('ouvrir 10 paquets pour 500 Navigos', async () => {
  const { game, store } = setup();
  await game.register('tenpack', 'secret1');
  const u = await store.get('user:tenpack'); u.navigos = 520; await store.set('user:tenpack', u);
  await assert.rejects(game.buyPack('tenpack', 3), /invalide/);
  const r = await game.buyPack('tenpack', 10);
  assert.equal(r.cards.length, 50);
  assert.equal(r.user.navigos, 20);
  assert.equal(Object.values(r.user.cards).reduce((a, b) => a + b, 0), 50);
  await assert.rejects(game.buyPack('tenpack', 10), /500 Navigos/);
});
