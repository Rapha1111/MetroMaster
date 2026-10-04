'use strict';
const { LINES } = require('./metro');

const lineIds = (l) => [...new Set(LINES[l].routes.flat())];
const complete = (cards, l) => lineIds(l).every((id) => cards[id]);

const ACHIEVEMENTS = [
  { id: 'line', title: 'Terminus !', desc: 'Finir une ligne', reward: 10, test: (c) => Object.keys(LINES).some((l) => complete(c, l)) },
  { id: 'line15', title: 'Grand voyageur', desc: 'Finir une ligne d\'au moins 15 gares', reward: 25,
    test: (c) => Object.keys(LINES).some((l) => lineIds(l).length >= 15 && complete(c, l)) },
  { id: 'line8', title: 'Ligne 8, de Balard à Pointe du Lac', desc: 'Finir la ligne 8', reward: 50, test: (c) => complete(c, '8') },
  { id: 'all', title: 'Maître du réseau', desc: 'Finir la collection (toutes les gares)', reward: 100,
    test: (c) => require('./metro').catalog().stations.every((s) => c[s.id]) },
];

module.exports = { ACHIEVEMENTS };
