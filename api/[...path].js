'use strict';
const { createStore } = require('../lib/store');
const { createGame } = require('../lib/game');
const { sign, verify } = require('../lib/auth');
const { catalog } = require('../lib/metro');

const g = globalThis;
const store = (g.__mmStore ||= createStore());
const game = (g.__mmGame ||= createGame(store));

if (process.env.VERCEL && !process.env.AUTH_SECRET) console.warn('AUTH_SECRET non défini !');

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 20_000) break; chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const route = `${req.method} /${parts.join('/')}`;
    const body = req.method === 'POST' ? await readBody(req) : {};

    if (route === 'GET /health') return send(res, 200, { ok: true, persistent: store.persistent });
    if (route === 'GET /catalog') { res.setHeader('Cache-Control', 'public, max-age=3600'); res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(catalog())); }

    if (route === 'POST /register') {
      const { user } = await game.register(body.username, body.password);
      return send(res, 200, { token: sign(user.name), user });
    }
    if (route === 'POST /login') {
      const user = await game.login(body.username, body.password);
      return send(res, 200, { token: sign(user.name), user });
    }

    const auth = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const name = verify(auth);
    if (!name) return send(res, 401, { error: 'Session expirée, reconnecte-toi.' });

    switch (route) {
      case 'GET /me': return send(res, 200, { user: await game.me(name) });
      case 'POST /open': return send(res, 200, await game.open(name));
      case 'POST /scrap': return send(res, 200, await game.scrap(name, body.id, body.qty));
      case 'POST /scrap-duplicates': return send(res, 200, await game.scrapDuplicates(name));
      case 'POST /read': return send(res, 200, { user: await game.markRead(name) });
      case 'GET /market': return send(res, 200, await game.market());
      case 'POST /auctions': return send(res, 200, await game.createAuction(name, body.id, body.minPrice));
    }
    const m = /^auctions\/(\d+)\/(bid|cancel)$/.exec(parts.join('/'));
    if (m && req.method === 'POST') {
      return send(res, 200, m[2] === 'bid' ? await game.bid(name, m[1], body.amount) : await game.cancelAuction(name, m[1]));
    }
    return send(res, 404, { error: 'Route inconnue.' });
  } catch (e) {
    if (!e.status) console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Erreur serveur.' });
  }
};
