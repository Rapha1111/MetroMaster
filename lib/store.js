'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Stockage clé/valeur JSON avec verrou global (le jeu est petit : un verrou suffit).
// - Upstash Redis / Vercel KV via REST si les variables d'environnement sont définies
// - sinon mémoire (+ fichier .data/db.json en local)

class MemoryStore {
  constructor(file) {
    this.persistent = Boolean(file);
    this.file = file;
    this.m = new Map();
    this.chain = Promise.resolve();
    if (file && fs.existsSync(file)) {
      try { this.m = new Map(Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))); } catch { /* ignore */ }
    }
  }
  async get(k) { const v = this.m.get(k); return v === undefined ? null : JSON.parse(v); }
  async set(k, v) { this.m.set(k, JSON.stringify(v)); this._flush(); }
  async del(k) { this.m.delete(k); this._flush(); }
  _flush() {
    if (!this.file) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(Object.fromEntries(this.m)));
  }
  lock(fn) {
    const run = this.chain.then(fn, fn);
    this.chain = run.catch(() => {});
    return run;
  }
}

class RedisStore {
  constructor(url, token) { this.url = url.replace(/\/$/, ''); this.token = token; this.persistent = true; }
  async cmd(...args) {
    const r = await fetch(this.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const j = await r.json();
    if (j.error) throw new Error(`Redis: ${j.error}`);
    return j.result;
  }
  async get(k) { const v = await this.cmd('GET', k); return v == null ? null : JSON.parse(v); }
  async set(k, v) { await this.cmd('SET', k, JSON.stringify(v)); }
  async del(k) { await this.cmd('DEL', k); }
  async lock(fn) {
    const key = 'lock:global';
    const token = crypto.randomBytes(8).toString('hex');
    const deadline = Date.now() + 8000;
    while ((await this.cmd('SET', key, token, 'NX', 'PX', '10000')) !== 'OK') {
      if (Date.now() > deadline) throw Object.assign(new Error('Serveur occupé, réessaie.'), { status: 503 });
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 60));
    }
    try { return await fn(); }
    finally {
      await this.cmd('EVAL', "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", '1', key, token).catch(() => {});
    }
  }
}

function createStore() {
  const e = process.env;
  const url = e.UPSTASH_REDIS_REST_URL || e.KV_REST_API_URL;
  const token = e.UPSTASH_REDIS_REST_TOKEN || e.KV_REST_API_TOKEN;
  if (url && token) return new RedisStore(url, token);
  if (e.VERCEL) return new MemoryStore(null);
  return new MemoryStore(e.DATA_FILE || path.join(process.cwd(), '.data', 'db.json'));
}

module.exports = { MemoryStore, RedisStore, createStore };
