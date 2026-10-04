'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MemoryStore } = require('../lib/store');
const { createGame } = require('../lib/game');
const { STATIONS } = require('../lib/metro');

const H = 3600 * 1000;
function setup() {
  let now = 1_000_000_000_000;
  const game = createGame(new MemoryStore(null), () => now);
  return { game, advance: (ms) => { now += ms; } };
}

test('rareté selon le nombre de lignes', () => {
  assert.equal(STATIONS.chatelet.rarity, 'legendaire');
  assert.equal(STATIONS.nation.rarity, 'super-rare');
  assert.equal(STATIONS.opera.rarity, 'rare');
  assert.equal(STATIONS['gare-de-lyon'].rarity, 'peu-commune');
  assert.equal(STATIONS.simplon.rarity, 'commune');
});

test('une gare par heure', async () => {
  const { game, advance } = setup();
  await game.register('alice', 'secret1');
  await game.open('alice');
  await assert.rejects(game.open('alice'), /Pas encore/);
  advance(H - 1);
  await assert.rejects(game.open('alice'), /Pas encore/);
  advance(1);
  await game.open('alice');
  advance(5 * H);
  assert.equal((await game.me('alice')).charges, 5);
  advance(100 * H);
  assert.equal((await game.me('alice')).charges, 24);
});

test('défonce contre des Navigos', async () => {
  const { game } = setup();
  await game.register('bob', 'secret1');
  const before = await game.me('bob');
  const [id, q] = Object.entries(before.cards)[0];
  const r = await game.scrap('bob', id, q);
  assert.ok(r.gain > 0);
  assert.equal(r.user.navigos, before.navigos + r.gain);
  await assert.rejects(game.scrap('bob', id, 1), /pas assez/);
});

test('enchère : surenchère, remboursement, vente, prix moyen', async () => {
  const { game, advance } = setup();
  await game.register('seller', 'secret1');
  await game.register('bidder1', 'secret1');
  await game.register('bidder2', 'secret1');
  const s = await game.me('seller');
  const id = Object.keys(s.cards)[0];
  const { auction } = await game.createAuction('seller', id, 10);
  await assert.rejects(game.bid('bidder1', auction.id, 9), /minimale/);
  await assert.rejects(game.bid('seller', auction.id, 20), /propre/);
  await game.bid('bidder1', auction.id, 20);
  assert.equal((await game.me('bidder1')).navigos, 80);
  await assert.rejects(game.bid('bidder2', auction.id, 20), /minimale/);
  await game.bid('bidder2', auction.id, 30);
  assert.equal((await game.me('bidder1')).navigos, 100);
  advance(24 * H + 1);
  const m = await game.market();
  assert.equal(m.auctions.length, 0);
  assert.equal(m.prices[id].avg, 30);
  assert.equal((await game.me('seller')).navigos, 100 + 29);
  assert.ok((await game.me('bidder2')).cards[id] >= 1);
});

test('enchère sans enchérisseur : la carte revient', async () => {
  const { game, advance } = setup();
  await game.register('carol', 'secret1');
  const id = Object.keys((await game.me('carol')).cards)[0];
  const n = (await game.me('carol')).cards[id];
  await game.createAuction('carol', id, 5);
  advance(25 * H);
  assert.equal((await game.me('carol')).cards[id], n);
});
