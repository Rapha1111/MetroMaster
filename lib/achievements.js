'use strict';
const { LINES } = require('./metro');

const NETWORKS = {
  metro: { label: 'métro', line: (l) => `la ligne ${l.replace('bis', ' bis')}` },
  rer: { label: 'RER', line: (l) => `le RER ${l}` },
  transilien: { label: 'Transilien', line: (l) => `la ligne ${l} du Transilien` },
  tram: { label: 'tramway', line: (l) => `le tram ${l}` },
};

const stationsOf = (l) => [...new Set(LINES[l].routes.flat())];
const complete = (cards, l) => stationsOf(l).every((id) => cards[id]);

// Chaque succès : un ensemble de lignes (`lines`) et un mode — 'any' (finir au moins une) ou 'all' (finir toutes).
const ACHIEVEMENTS = [];
for (const [net, n] of Object.entries(NETWORKS)) {
  const lines = Object.keys(LINES).filter((l) => LINES[l].network === net);
  const longest = lines.reduce((a, b) => (stationsOf(b).length >= stationsOf(a).length ? b : a));
  ACHIEVEMENTS.push(
    { id: `line-${net}`, network: net, title: 'Premier terminus', desc: `Finir une ligne de ${n.label}`, reward: 10, mode: 'any', lines },
    { id: `line10-${net}`, network: net, title: 'Long trajet', desc: `Finir une ligne de ${n.label} d'au moins 10 gares`, reward: 25, mode: 'any',
      lines: lines.filter((l) => stationsOf(l).length >= 10) },
    { id: `longest-${net}`, network: net, title: 'Bout du monde', desc: `Finir ${n.line(longest)} (${stationsOf(longest).length} gares, la plus longue)`, reward: 50, mode: 'any', lines: [longest] },
    { id: `all-${net}`, network: net, title: 'Maître du réseau', desc: `Finir toutes les lignes de ${n.label}`, reward: 100, mode: 'all', lines },
  );
}
for (const a of ACHIEVEMENTS) {
  a.test = (c) => (a.mode === 'all' ? a.lines.every((l) => complete(c, l)) : a.lines.some((l) => complete(c, l)));
}

module.exports = { ACHIEVEMENTS, NETWORKS };
