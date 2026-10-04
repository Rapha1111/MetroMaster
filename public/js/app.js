// MetroMaster – client (JS vanilla, sans build)
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const S = {
  token: null, user: null, cat: null, market: null, skew: 0,
  tab: 'home', auth: 'login',
  col: { q: '', rarity: 'all', net: 'all', line: 'all', own: 'all', sort: 'rarity', limit: 60 },
  openLines: new Set(), aucTab: 'all', aucQ: '',
};
try { S.token = localStorage.getItem('mm_token'); S.tab = localStorage.getItem('mm_tab') || 'home'; } catch {}

// ---------- API ----------
async function api(path, body) {
  const opts = { method: body === undefined ? 'GET' : 'POST', headers: {} };
  if (S.token) opts.headers.Authorization = `Bearer ${S.token}`;
  if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(`/api${path}`, opts); } catch { throw new Error('Connexion impossible. Vérifie ton réseau.'); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && S.token && !path.startsWith('/login')) { logout(true); throw new Error(j.error || 'Session expirée.'); }
  if (!r.ok) throw new Error(j.error || 'Erreur.');
  return j;
}
function setUser(u) { S.user = u; S.skew = u.now - Date.now(); }
const now = () => Date.now() + S.skew;

function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`; el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3400);
}
async function act(fn) { try { return await fn(); } catch (e) { toast(e.message, 'err'); } }

// ---------- helpers ----------
const DURS = [[600000, '10 minutes'], [3600000, '1 heure'], [21600000, '6 heures'], [43200000, '12 heures'], [86400000, '24 heures']];
const RAR = {}; const ST = {};
const rar = (id) => RAR[id];
const stationOf = (id) => ST[id];
const fmt = (n) => Number(n).toLocaleString('fr-FR');
function left(ms) {
  ms = Math.max(0, ms); const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
}
const bullet = (l, lg) => {
  const L = S.cat.lines[l];
  return `<span class="bullet ${l.includes('bis') ? 'b-bis' : ''} ${L.network === 'tram' ? 'tram' : ''} ${lg ? 'lg' : ''}" style="background:${L.color};color:${L.text}">${l.replace('bis', 'b')}</span>`;
};
const navi = (n) => `<span class="price"><span class="navigo">N</span>${fmt(n)}</span>`;

function cardHTML(id, { qty = 0, locked = false, attr = 'data-station' } = {}) {
  const st = stationOf(id), r = rar(st.rarity);
  return `<div class="card r-${st.rarity} ${locked ? 'locked' : ''}" ${locked ? '' : `${attr}="${id}"`}>
    <div class="card-top"><span>${r.label}</span>${qty > 1 ? `<span class="qty">×${qty}</span>` : ''}</div>
    <div class="art">${bullet(st.lines[0])}</div>
    <div class="plaque"><span>${esc(st.name)}</span></div>
    <div class="bullets">${st.lines.map((l) => bullet(l)).join('')}</div>
  </div>`;
}

const owned = () => S.user.cards;
const uniqueOwned = () => Object.keys(owned()).length;
const lineProgress = (l) => {
  const ids = [...new Set(S.cat.lines[l].routes.flat())];
  return { total: ids.length, have: ids.filter((i) => owned()[i]).length, ids };
};
const marketPrice = (id) => S.market?.prices?.[id];

// ---------- icons ----------
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="12" height="17" rx="2"/><path d="M8 21h10a2 2 0 002-2V8"/></svg>',
  lines: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="7" cy="19" r="2"/><path d="M7 6h6a4 4 0 010 8H9a3 3 0 000 5"/></svg>',
  auction: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L4 14l3 3 7-7"/><path d="M3 21h10"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
};
const TABS = [['home', 'Tirage', ICON.home], ['cards', 'Collection', ICON.cards], ['lines', 'Lignes', ICON.lines], ['auctions', 'Enchères', ICON.auction], ['me', 'Profil', ICON.user]];

// ---------- rendering ----------
function render() {
  if (!S.user) return renderAuth();
  const u = S.user;
  $('#app').innerHTML = `<div class="shell">
    ${S.volatile ? '<div class="warn-banner">⚠️ Base de données non configurée sur le serveur : ta progression sera perdue à la prochaine mise à jour. Connecte Upstash Redis dans Vercel (voir README).</div>' : ''}
    <header class="topbar"><div class="logo"><i>M</i>MetroMaster</div><div class="spacer"></div>
      <div class="wallet" title="Tes Navigos"><span class="navigo">N</span><span id="wallet">${fmt(u.navigos)}</span></div></header>
    <main class="main" id="view"></main>
    <nav class="nav">${TABS.map(([id, label, ic]) => `<button data-tab="${id}" class="${S.tab === id ? 'active' : ''}">${ic}<span>${label}</span>${id === 'me' && u.unread ? `<b class="dot">${u.unread}</b>` : ''}</button>`).join('')}</nav>
  </div>`;
  renderView();
}
function renderView() {
  const v = $('#view'); if (!v) return;
  ({ home: viewHome, cards: viewCards, lines: viewLines, auctions: viewAuctions, me: viewMe }[S.tab] || viewHome)(v);
  const w = $('#wallet'); if (w) w.textContent = fmt(S.user.navigos);
  tick();
}

function renderAuth() {
  const reg = S.auth === 'register';
  $('#app').innerHTML = `<div class="auth"><div class="auth-card">
    <div class="auth-hero"><div class="big">M</div><h1>MetroMaster</h1><p class="muted">Collectionne les 300+ stations du métro parisien.<br>Une nouvelle gare chaque heure.</p></div>
    <form class="panel" id="authForm">
      <div class="tabs"><button type="button" data-auth="login" class="${reg ? '' : 'active'}">Connexion</button><button type="button" data-auth="register" class="${reg ? 'active' : ''}">Créer un compte</button></div>
      <label for="u">Pseudo</label><input id="u" autocomplete="username" autocapitalize="none" autocorrect="off" required minlength="3" maxlength="20">
      <label for="p">Mot de passe</label><input id="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required minlength="6">
      <div class="err" id="authErr"></div>
      <button class="btn primary block" id="authBtn">${reg ? '🚇 Commencer l\'aventure' : 'Se connecter'}</button>
      ${reg ? '<p class="hint" style="text-align:center">5 gares + 100 Navigos offerts à l\'inscription.</p>' : ''}
    </form></div></div>`;
}

function viewHome(v) {
  const u = S.user, total = Object.keys(ST).length;
  const done = Object.keys(S.cat.lines).filter((l) => { const p = lineProgress(l); return p.have === p.total; }).length;
  v.innerHTML = `
  <section class="panel hero">
    <div class="ring" id="ring"><div><div class="t" id="ringT">…</div><div class="s" id="ringS"></div></div></div>
    <button class="btn primary" id="openBtn" style="min-width:230px;font-size:18px;padding:15px 22px">Ouvrir un paquet</button>
    <p class="hint" style="margin:12px 0 0" id="stock"></p>
  </section>
  <div class="section-title"><h2>Ta progression</h2></div>
  <div class="stats">
    <div class="stat"><b>${uniqueOwned()}<small class="muted">/${total}</small></b><span>Gares</span></div>
    <div class="stat"><b>${done}<small class="muted">/${Object.keys(S.cat.lines).length}</small></b><span>Lignes complètes</span></div>
    <div class="stat"><b>${Object.values(owned()).reduce((a, b) => a + b, 0)}</b><span>Cartes</span></div>
  </div>
  <div class="bar" style="margin-top:12px"><i style="width:${(uniqueOwned() / total) * 100}%"></i></div>
  <div class="grid2">
    <div><div class="section-title"><h2>Probabilités</h2></div>
      <div class="panel odds">${S.cat.rarities.map((r) => {
        const tot = S.cat.rarities.reduce((a, x) => a + x.weight, 0);
        const n = S.cat.stations.filter((s) => s.rarity === r.id).length;
        return `<div><i style="background:${r.color}"></i><b>${r.label}</b><span class="muted">${n} gares</span><em>${(r.weight / tot * 100).toFixed(1)} %</em></div>`;
      }).join('')}<p class="hint" style="margin:6px 0 0">Plus une gare est desservie par de lignes (métro, RER, Transilien, tram), plus elle est rare : 1 ligne = commune, 2 = peu commune, 3 = rare, 4 = super rare, 5 et plus = légendaire. Chaque paquet contient 5 gares.</p></div></div>
    <div><div class="section-title"><h2>Activité récente</h2></div>${logHTML(u.log.slice(0, 5))}</div>
  </div>`;
}
function logHTML(items) {
  if (!items.length) return '<div class="panel empty">Rien pour l\'instant.</div>';
  const ago = (t) => { const m = Math.max(0, Math.round((now() - t) / 60000)); return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
  return `<div class="log">${items.map((l) => `<div class="${l.type}"><span>${esc(l.msg)}<small>${ago(l.t)}</small></span></div>`).join('')}</div>`;
}

function viewCards(v) {
  const f = S.col;
  const rarOrder = S.cat.rarities.map((r) => r.id);
  let list = S.cat.stations.filter((s) => {
    if (f.rarity !== 'all' && s.rarity !== f.rarity) return false;
    if (f.net !== 'all' && !s.lines.some((l) => S.cat.lines[l].network === f.net)) return false;
    if (f.line !== 'all' && !s.lines.includes(f.line)) return false;
    if (f.own === 'own' && !owned()[s.id]) return false;
    if (f.own === 'missing' && owned()[s.id]) return false;
    if (f.own === 'dup' && !(owned()[s.id] > 1)) return false;
    if (f.q && !s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(f.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))) return false;
    return true;
  });
  const by = {
    rarity: (a, b) => rarOrder.indexOf(b.rarity) - rarOrder.indexOf(a.rarity) || a.name.localeCompare(b.name, 'fr'),
    name: (a, b) => a.name.localeCompare(b.name, 'fr'),
    qty: (a, b) => (owned()[b.id] || 0) - (owned()[a.id] || 0) || a.name.localeCompare(b.name, 'fr'),
  }[f.sort];
  list.sort(by);
  const dups = Object.values(owned()).reduce((a, q) => a + Math.max(0, q - 1), 0);
  v.innerHTML = `
  <div class="section-title" style="margin-top:4px"><h2>Collection <span class="muted" style="font-size:15px">${uniqueOwned()}/${Object.keys(ST).length}</span></h2>
    ${dups ? `<button class="btn small danger" data-act="scrapDups">Défausser ${dups} doublon${dups > 1 ? 's' : ''}</button>` : ''}</div>
  <div class="toolbar">
    <div class="row"><input id="q" type="search" placeholder="Chercher une gare…" value="${esc(f.q)}">
      <select id="sort" style="width:auto"><option value="rarity" ${f.sort === 'rarity' ? 'selected' : ''}>Rareté</option><option value="name" ${f.sort === 'name' ? 'selected' : ''}>A → Z</option><option value="qty" ${f.sort === 'qty' ? 'selected' : ''}>Quantité</option></select></div>
    <div class="chips">${[['all', 'Toutes'], ['own', 'Possédées'], ['missing', 'Manquantes'], ['dup', 'Doublons']].map(([k, l]) => `<button class="chip ${f.own === k ? 'active' : ''}" data-own="${k}">${l}</button>`).join('')}</div>
    <div class="chips"><button class="chip ${f.rarity === 'all' ? 'active' : ''}" data-rarity="all">Toutes raretés</button>${S.cat.rarities.map((r) => `<button class="chip ${f.rarity === r.id ? 'active' : ''}" data-rarity="${r.id}"><i style="width:9px;height:9px;border-radius:50%;background:${r.color}"></i>${r.label}</button>`).join('')}</div>
    <div class="chips"><button class="chip ${f.net === 'all' ? 'active' : ''}" data-net="all">Tous réseaux</button>${S.cat.networks.map((n) => `<button class="chip ${f.net === n.id ? 'active' : ''}" data-net="${n.id}">${n.label}</button>`).join('')}</div>
    <div class="chips"><button class="chip ${f.line === 'all' ? 'active' : ''}" data-line="all">Toutes lignes</button>${Object.keys(S.cat.lines).filter((l) => f.net === 'all' || S.cat.lines[l].network === f.net).map((l) => `<button class="chip ${f.line === l ? 'active' : ''}" data-line="${l}" style="padding:4px 8px">${bullet(l)}</button>`).join('')}</div>
  </div>
  <div class="cards" id="grid">${list.length ? list.slice(0, f.limit).map((s) => cardHTML(s.id, { qty: owned()[s.id] || 0, locked: !owned()[s.id], attr: 'data-station' })).join('') : '<div class="empty" style="grid-column:1/-1">Aucune gare ne correspond.</div>'}</div>
  ${list.length > f.limit ? `<div style="text-align:center;margin-top:16px"><button class="btn" data-more>Afficher plus (${list.length - f.limit} restantes)</button></div>` : `<p class="hint" style="text-align:center;margin-top:14px">${list.length} gare${list.length > 1 ? 's' : ''}</p>`}`;
}

function viewLines(v) {
  v.innerHTML = `<div class="section-title" style="margin-top:4px"><h2>Avancement des lignes</h2></div>
  ${S.cat.networks.map((n) => {
    const ids = Object.keys(S.cat.lines).filter((l) => S.cat.lines[l].network === n.id);
    const fin = ids.filter((l) => { const p = lineProgress(l); return p.have === p.total; }).length;
    return `<div class="section-title" style="margin:18px 0 10px"><h2 style="font-size:17px">${n.label}</h2><span class="muted">${fin}/${ids.length} complètes</span></div>
  <div style="display:grid;gap:12px">${ids.map((l) => {
    const L = S.cat.lines[l], p = lineProgress(l), open = S.openLines.has(l), full = p.have === p.total;
    return `<div class="panel line-card ${open ? 'open' : ''}" style="--lc:${L.color}">
      <button class="line-head" data-line-toggle="${l}">${bullet(l, true)}
        <div class="info"><b>${L.network === 'metro' ? 'Ligne ' : L.network === 'rer' ? 'RER ' : L.network === 'tram' ? 'Tram ' : 'Transilien '}${l.replace('bis', ' bis')}${full ? '<span class="badge-done">COMPLÈTE ★</span>' : ''}</b>
        <div class="bar"><i style="width:${(p.have / p.total) * 100}%;background:${L.color}"></i></div></div>
        <span class="count">${p.have}/${p.total}</span><svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button>
      ${open ? `<div class="route">${L.routes.map((route, i) => `${L.routes.length > 1 ? `<h4>${i === 0 ? 'Tronc commun' : `Branche ${i}`}</h4>` : ''}${route.map((id) => {
        const st = stationOf(id), have = owned()[id];
        return `<div class="stop ${have ? 'have' : ''}" data-station="${id}"><span class="nm">${esc(st.name)}</span>${st.lines.length > 1 ? `<span class="muted" style="font-size:12px">${st.lines.length} lignes</span>` : ''}<span class="rt" style="color:${rar(st.rarity).color}">${rar(st.rarity).label}</span></div>`;
      }).join('')}`).join('')}</div>` : ''}
    </div>`;
  }).join('')}</div>`;
  }).join('')}`;
}

function viewAuctions(v) {
  if (!S.market) { v.innerHTML = '<div class="spinner"></div>'; loadMarket().then(() => S.tab === 'auctions' && renderView()); return; }
  const me = S.user.name.toLowerCase();
  const isMine = (a) => a.seller.toLowerCase() === me;
  const isLeading = (a) => a.bid?.user.toLowerCase() === me;
  const hasBid = (a) => !isMine(a) && (isLeading(a) || (a.bidders || []).some((n) => n.toLowerCase() === me));
  const mineN = S.market.auctions.filter(isMine).length, posN = S.market.auctions.filter(hasBid).length;
  let list = S.market.auctions.slice();
  if (S.aucTab === 'mine') list = list.filter(isMine);
  if (S.aucTab === 'pos') list = list.filter(hasBid);
  const q = S.aucQ.toLowerCase();
  if (q) list = list.filter((a) => stationOf(a.stationId).name.toLowerCase().includes(q));
  list.sort((a, b) => a.endsAt - b.endsAt);
  const tab = (k, l) => `<button data-auc="${k}" class="${S.aucTab === k ? 'active' : ''}">${l}</button>`;
  const empty = { all: 'Aucune enchère en cours.', mine: "Tu n'as aucune enchère en cours. Pour vendre une gare, ouvre-la depuis l'onglet Collection.", pos: "Tu n'as enchéri sur aucune gare pour l'instant." }[S.aucTab];
  v.innerHTML = `<div class="section-title" style="margin-top:4px"><h2>Enchères</h2></div>
  <div class="tabs">${tab('all', `En cours (${S.market.auctions.length})`)}${tab('mine', `Mes enchères (${mineN}/${S.market.maxActive})`)}${tab('pos', `Mes positions (${posN})`)}</div>
  <div class="toolbar" style="margin:10px 0"><input id="aq" type="search" placeholder="Chercher une gare…" value="${esc(S.aucQ)}"></div>
  <div class="auclist">${list.length ? list.map((a) => {
    const mine = isMine(a), leading = isLeading(a), pr = marketPrice(a.stationId), bidder = hasBid(a);
    return `<div class="panel auc">${cardHTML(a.stationId, { attr: 'data-none' })}
      <div class="meta"><span class="muted">par ${esc(a.seller)}${mine ? ' (toi)' : ''}</span>
        <span>${a.bid ? `Enchère actuelle ${navi(a.bid.amount)}${mine ? ` par ${esc(a.bid.user)}` : ''}` : `Mise de départ ${navi(a.minPrice)}`}</span>
        <span class="muted">${a.bidCount} enchère${a.bidCount > 1 ? 's' : ''} · ⏱ <b data-end="${a.endsAt}">${left(a.endsAt - now())}</b></span>
        <span class="muted">Prix moyen : ${pr ? `${navi(pr.avg)} <small>(${pr.count} vente${pr.count > 1 ? 's' : ''})</small>` : 'aucune vente'}</span>
        <div>${leading ? '<span class="tag ok">🥇 Tu es en tête</span>' : bidder ? '<span class="tag warn">Tu as été dépassé</span>' : ''}</div>
        <div class="actions">${mine ? (a.bid ? '<span class="tag">Enchère en cours</span>' : `<button class="btn small danger" data-cancel="${a.id}">Annuler</button>`) : `<button class="btn small primary" data-bid="${a.id}">${leading ? 'Surenchérir' : bidder ? 'Reprendre la tête' : 'Enchérir'}</button>`}</div>
      </div></div>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1">${empty}</div>`}</div>
  <p class="hint" style="margin-top:14px">Aucun frais. Tu peux avoir ${S.market.maxActive} enchères en cours au maximum. Une surenchère doit dépasser l'actuelle d'au moins ${Math.round(S.market.minRaise * 100)} %.</p>`;
}

function achProgress(a) {
  const ps = a.lines.map((l) => ({ l, ...lineProgress(l) }));
  if (a.mode === 'all') return { have: ps.filter((p) => p.have === p.total).length, total: ps.length, unit: 'lignes' };
  const best = ps.reduce((m, p) => (p.have / p.total > m.have / m.total ? p : m), ps[0]);
  return { have: best.have, total: best.total, unit: `gares · ligne ${best.l.replace('bis', ' bis')}` };
}
function achHTML(a) {
  const got = S.user.ach && S.user.ach[a.id], p = achProgress(a);
  return `<div class="${got ? 'win' : ''}" style="flex-wrap:wrap"><span style="flex:1;min-width:0"><b>${got ? '🏆' : '🔒'} ${esc(a.title)}</b><small>${esc(a.desc)}</small></span>
    <span class="price">${got ? '✓' : `+${a.reward}`} <span class="navigo">N</span></span>
    ${got ? '' : `<span style="flex-basis:100%"><span class="bar"><i style="width:${(p.have / p.total) * 100}%"></i></span><small>${p.have}/${p.total} ${p.unit}</small></span>`}</div>`;
}

function viewMe(v) {
  const u = S.user, st = u.stats;
  v.innerHTML = `<div class="section-title" style="margin-top:4px"><h2>${esc(u.name)}</h2><button class="btn small" data-act="logout">Se déconnecter</button></div>
  <div class="panel" style="display:flex;align-items:center;gap:14px"><span class="navigo" style="width:44px;height:44px;font-size:22px;border-radius:12px">N</span><div><div class="muted" style="font-size:13px">Solde</div><div style="font-size:28px;font-weight:800">${fmt(u.navigos)} Navigos</div></div></div>
  <div class="stats" style="margin-top:12px">
    <div class="stat"><b>${st.opened}</b><span>Paquets ouverts</span></div><div class="stat"><b>${st.sold}</b><span>Ventes</span></div><div class="stat"><b>${st.scrapped}</b><span>Défaussées</span></div></div>
  <div class="section-title"><h2>Succès</h2><span class="muted">${Object.keys(u.ach || {}).filter((k) => S.cat.achievements.some((a) => a.id === k)).length}/${S.cat.achievements.length} débloqués</span></div>
  ${S.cat.networks.map((n) => `<h3 style="font-size:15px;margin:14px 0 8px;color:var(--muted)">${n.label}</h3><div class="log">${S.cat.achievements.filter((a) => a.network === n.id).map(achHTML).join('')}</div>`).join('')}
  <div class="section-title"><h2>Journal</h2></div>${logHTML(u.log)}
  <p class="hint" style="margin-top:16px;text-align:center">Compte créé le ${new Date(u.created).toLocaleDateString('fr-FR')} · Ta progression est sauvegardée sur ton compte.</p>`;
  if (u.unread) api('/read', {}).then((r) => { setUser(r.user); const d = $('.nav .dot'); if (d) d.remove(); }).catch(() => {});
}

// ---------- modals ----------
function modal(html, onMount) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="backdrop" data-close><div class="modal panel">${html}<button class="x" data-close aria-label="Fermer">✕</button></div></div>`;
  root.firstElementChild.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeModal(); });
  onMount?.(root);
}
const closeModal = () => { $('#modal-root').innerHTML = ''; };

function detail(id) {
  const st = stationOf(id), r = rar(st.rarity), q = owned()[id] || 0, pr = marketPrice(id);
  modal(`<div style="height:8px"></div>${cardHTML(id, { qty: q, attr: 'data-none' })}
    <div class="facts">
      <div class="stat"><b style="color:${r.color}">${r.label}</b><span>${st.lines.length} ligne${st.lines.length > 1 ? 's' : ''}</span></div>
      <div class="stat"><b>${q}</b><span>Exemplaire${q > 1 ? 's' : ''}</span></div>
      <div class="stat"><b>${pr ? fmt(pr.avg) : '—'}</b><span>Prix moyen enchères${pr ? ` (${pr.count})` : ''}</span></div>
      <div class="stat"><b>${r.scrap}</b><span>Navigos si défaussée</span></div></div>
    ${q ? `<div class="actions-col">
      <button class="btn primary" data-sell="${id}">Mettre aux enchères</button>
      <button class="btn danger" data-scrap="${id}" data-n="1">Défausser 1 exemplaire (+${r.scrap} N)</button>
      ${q > 1 ? `<button class="btn danger" data-scrap="${id}" data-n="${q - 1}">Défausser les ${q - 1} doublons (+${r.scrap * (q - 1)} N)</button>` : ''}</div>`
      : '<p class="hint" style="text-align:center">Tu ne possèdes pas encore cette gare. Tente ta chance au tirage ou aux enchères !</p><div class="actions-col"><button class="btn" data-goto-auc>Voir les enchères</button></div>'}`);
}

function sellModal(id) {
  const st = stationOf(id), pr = marketPrice(id), r = rar(st.rarity);
  const suggested = pr ? pr.avg : Math.max(1, r.scrap * 2);
  modal(`<h3 style="margin:6px 40px 12px 0">Mettre aux enchères</h3><div style="max-width:170px;margin:0 auto 12px">${cardHTML(id, { attr: 'data-none' })}</div>
    <p class="hint" style="text-align:center">${pr ? `Prix moyen de vente : <b>${fmt(pr.avg)} N</b> (de ${pr.min} à ${pr.max}, ${pr.count} vente${pr.count > 1 ? 's' : ''})` : 'Aucune vente connue pour cette gare.'}</p>
    <label for="mp">Prix minimum (Navigos)</label><input id="mp" type="number" inputmode="numeric" min="1" value="${suggested}">
    <label for="dur">Durée de l'enchère</label>
    <select id="dur">${DURS.map(([ms, l]) => `<option value="${ms}" ${ms === 86400000 ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <p class="hint">Aucun frais. Tu peux avoir ${S.market?.maxActive ?? 5} enchères en cours au maximum. La carte est mise de côté jusqu'à la fin de l'enchère.</p>
    <button class="btn primary block" data-confirm-sell="${id}">Lancer l'enchère</button>`);
}

function bidModal(aid) {
  const a = S.market.auctions.find((x) => x.id === aid); if (!a) return;
  const min = a.bid ? Math.max(a.bid.amount + 1, Math.ceil(a.bid.amount * (1 + S.market.minRaise))) : a.minPrice, pr = marketPrice(a.stationId);
  modal(`<h3 style="margin:6px 40px 12px 0">Enchérir</h3><div style="max-width:170px;margin:0 auto 12px">${cardHTML(a.stationId, { attr: 'data-none' })}</div>
    <div class="facts"><div class="stat"><b>${fmt(min)}</b><span>Enchère minimale</span></div><div class="stat"><b>${pr ? fmt(pr.avg) : '—'}</b><span>Prix moyen</span></div></div>
    <label for="ba">Ton enchère (Navigos) — solde : ${fmt(S.user.navigos)}</label><input id="ba" type="number" inputmode="numeric" min="${min}" value="${min}">
    <p class="hint">Tes Navigos sont bloqués tant que tu mènes, et te sont rendus si quelqu'un te dépasse.</p>
    <button class="btn primary block" data-confirm-bid="${aid}">Confirmer</button>`);
}

async function openPack() {
  const btn = $('#openBtn'); if (btn) btn.disabled = true;
  const r = await act(() => api('/open', {}));
  if (!r) { if (btn) btn.disabled = false; return; }
  setUser(r.user);
  const order = S.cat.rarities.map((x) => x.id);
  const best = r.cards.reduce((m, c) => Math.max(m, order.indexOf(stationOf(c.stationId).rarity)), 0);
  const nNew = r.cards.filter((c) => c.isNew).length;
  modal(`<h3 style="margin:6px 40px 14px 0">Ton paquet</h3>
    <div class="pack" id="pack">${r.cards.map((c, i) => `<div class="flip" style="--i:${i}"><div class="flip-in"><div class="back"><i>M</i></div>
      <div class="front">${cardHTML(c.stationId, { qty: c.qty, attr: 'data-none' })}${c.isNew ? '<span class="newtag">NEW</span>' : ''}</div></div></div>`).join('')}</div>
    <div class="reveal-title" id="rt"></div><p class="hint" style="text-align:center;margin:4px 0 14px" id="rs"></p>
    <div class="actions-col"><button class="btn primary" data-close id="again" disabled>Super !</button></div>`);
  const flips = [...document.querySelectorAll('#pack .flip')];
  flips.forEach((f, i) => setTimeout(() => f.classList.add('on'), 500 + i * 450));
  setTimeout(() => {
    const t = $('#rt'); if (!t) return;
    const rr = S.cat.rarities[best];
    t.style.color = rr.color;
    t.textContent = nNew ? `${nNew} nouvelle${nNew > 1 ? 's' : ''} gare${nNew > 1 ? 's' : ''} !` : 'Que des doublons…';
    $('#rs').textContent = `Meilleure carte : ${rr.label}.` + (r.newAch ? ' 🏆 Nouveau succès débloqué !' : '');
    $('#again').disabled = false;
    if (best >= 3 && navigator.vibrate) navigator.vibrate([60, 40, 120]);
  }, 500 + flips.length * 450 + 700);
  render();
}

// ---------- live timers ----------
function tick() {
  if (!S.user) return;
  const u = S.user, t = now();
  document.querySelectorAll('[data-end]').forEach((el) => { el.textContent = left(Number(el.dataset.end) - t); });
  const ring = $('#ring'); if (!ring) return;
  // recalcul local des charges
  let charges = u.charges, nextAt = u.nextAt;
  if (nextAt != null && t >= nextAt) {
    const n = 1 + Math.floor((t - nextAt) / 3600000);
    charges = Math.min(u.max, u.charges + n);
    nextAt = charges >= u.max ? null : nextAt + n * 3600000;
  }
  const ready = charges > 0;
  ring.classList.toggle('ready', ready);
  $('#ringT').textContent = ready ? `×${charges}` : left(nextAt - t);
  $('#ringS').textContent = ready ? (charges > 1 ? 'paquets prêts' : 'paquet prêt') : 'prochain paquet';
  ring.style.setProperty('--p', nextAt == null ? 100 : Math.min(100, (1 - (nextAt - t) / 3600000) * 100));
  const b = $('#openBtn'); if (b && !b.dataset.busy) b.disabled = !ready;
  $('#stock').textContent = ready ? (charges > 1 ? `${charges} paquets en stock (max ${u.max}).` : 'Ton paquet de l\'heure est prêt !') : `Stock : 0/${u.max} — un paquet de 5 gares est débloqué chaque heure.`;
}
setInterval(tick, 1000);

// ---------- data ----------
async function loadMarket() { try { S.market = await api('/market'); } catch (e) { toast(e.message, 'err'); } }
async function refreshMe() { try { setUser((await api('/me')).user); } catch {} }

function logout(silent) {
  S.token = null; S.user = null; S.market = null;
  try { localStorage.removeItem('mm_token'); } catch {}
  render();
  if (!silent) toast('Déconnecté.');
}

async function boot() {
  try {
    S.cat = await (await fetch('/api/catalog', { cache: 'no-cache' })).json();
    fetch('/api/health').then((r) => r.json()).then((h) => { S.volatile = h.persistent === false; if (S.volatile) render(); }).catch(() => {});
    for (const r of S.cat.rarities) RAR[r.id] = r;
    for (const s of S.cat.stations) ST[s.id] = s;
  } catch { $('#app').innerHTML = '<div class="empty">Impossible de charger le jeu. Recharge la page.</div>'; return; }
  if (S.token) { await refreshMe(); if (S.user) loadMarket(); }
  render();
}

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, [data-station], [data-sell]'); if (!t) return;
  const d = t.dataset;
  if (d.auth) { S.auth = d.auth; return renderAuth(); }
  if (d.tab) { S.tab = d.tab; try { localStorage.setItem('mm_tab', S.tab); } catch {} if (d.tab === 'auctions' || d.tab === 'cards') loadMarket().then(() => ['auctions'].includes(S.tab) && renderView()); render(); window.scrollTo(0, 0); return; }
  if (t.id === 'openBtn') return openPack();
  if (d.act === 'logout') return logout();
  if (d.act === 'scrapDups') {
    if (!confirm('Défausser tous tes doublons (en gardant 1 exemplaire de chaque gare) ?')) return;
    const r = await act(() => api('/scrap-duplicates', {})); if (r) { setUser(r.user); toast(`+${r.gain} Navigos (${r.count} cartes défaussées)`, 'ok'); render(); } return;
  }
  if (t.hasAttribute('data-more')) { S.col.limit += 60; return renderView(); }
  if (d.own) { S.col.own = d.own; S.col.limit = 60; return renderView(); }
  if (d.rarity) { S.col.rarity = d.rarity; S.col.limit = 60; return renderView(); }
  if (d.net) { S.col.net = d.net; S.col.line = 'all'; S.col.limit = 60; return renderView(); }
  if (d.line) { S.col.line = d.line; S.col.limit = 60; return renderView(); }
  if (d.lineToggle) { S.openLines.has(d.lineToggle) ? S.openLines.delete(d.lineToggle) : S.openLines.add(d.lineToggle); return renderView(); }
  if (d.auc) { S.aucTab = d.auc; return renderView(); }
  if (d.scrap) {
    const n = Number(d.n), q = owned()[d.scrap];
    if (n >= q && !confirm('C\'est ton dernier exemplaire : la gare disparaîtra de ta collection. Continuer ?')) return;
    const r = await act(() => api('/scrap', { id: d.scrap, qty: n }));
    if (r) { setUser(r.user); toast(`+${r.gain} Navigos`, 'ok'); closeModal(); render(); } return;
  }
  if (d.sell !== undefined && d.sell) return sellModal(d.sell);
  if (d.confirmSell) {
    const r = await act(() => api('/auctions', { id: d.confirmSell, minPrice: $('#mp').value, duration: Number($('#dur').value) }));
    if (r) { setUser(r.user); closeModal(); toast('Enchère lancée !', 'ok'); S.tab = 'auctions'; S.aucTab = 'mine'; await loadMarket(); render(); } return;
  }
  if (d.bid) return bidModal(Number(d.bid));
  if (d.confirmBid) {
    const r = await act(() => api('/bid', { auctionId: Number(d.confirmBid), amount: $('#ba').value }));
    if (r) { setUser(r.user); closeModal(); toast('Enchère placée !', 'ok'); await loadMarket(); render(); } return;
  }
  if (d.cancel) {
    const r = await act(() => api('/cancel', { auctionId: Number(d.cancel) }));
    if (r) { setUser(r.user); toast('Enchère annulée, la gare est revenue.', 'ok'); await loadMarket(); render(); } return;
  }
  if (d.gotoAuc !== undefined) { closeModal(); S.tab = 'auctions'; await loadMarket(); return render(); }
  if (d.station) return detail(d.station);
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { S.col.q = e.target.value; S.col.limit = 60; const pos = e.target.selectionStart; renderView(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  if (e.target.id === 'aq') { S.aucQ = e.target.value; const pos = e.target.selectionStart; renderView(); const q = $('#aq'); q.focus(); q.setSelectionRange(pos, pos); }
});
document.addEventListener('change', (e) => { if (e.target.id === 'sort') { S.col.sort = e.target.value; renderView(); } });
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'authForm') return;
  e.preventDefault();
  const btn = $('#authBtn'); btn.disabled = true; $('#authErr').textContent = '';
  try {
    const r = await api(S.auth === 'register' ? '/register' : '/login', { username: $('#u').value, password: $('#p').value });
    S.token = r.token; try { localStorage.setItem('mm_token', r.token); } catch {}
    setUser(r.user); await loadMarket(); S.tab = 'home'; render();
  } catch (err) { $('#authErr').textContent = err.message; btn.disabled = false; }
});

// rafraîchit quand l'app revient au premier plan
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && S.user) { await refreshMe(); if (S.tab === 'auctions') await loadMarket(); if (!$('#modal-root').firstChild) render(); }
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
boot();
