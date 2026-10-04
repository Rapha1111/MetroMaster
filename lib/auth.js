'use strict';
const crypto = require('crypto');

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';
const TTL = 30 * 24 * 3600 * 1000;

const scrypt = (pw, salt) => new Promise((res, rej) =>
  crypto.scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))));

async function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: (await scrypt(pw, salt)).toString('hex') };
}
async function verifyPassword(pw, salt, hash) {
  const k = await scrypt(pw, salt);
  const h = Buffer.from(hash, 'hex');
  return k.length === h.length && crypto.timingSafeEqual(k, h);
}

const b64 = (b) => Buffer.from(b).toString('base64url');
function sign(username, now = Date.now()) {
  const body = b64(JSON.stringify({ u: username, exp: now + TTL }));
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > now ? p.u : null;
  } catch { return null; }
}

module.exports = { hashPassword, verifyPassword, sign, verify };
