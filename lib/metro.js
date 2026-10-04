'use strict';
// Données du réseau métro parisien. Chaque ligne = un ou plusieurs trajets (tronc puis branches).
// La rareté d'une gare dépend du nombre de lignes qui la desservent.

const LINE_DEFS = [
  ['1', '#FFCD00', '#000', [[
    'La Défense', 'Esplanade de La Défense', 'Pont de Neuilly', 'Les Sablons', 'Porte Maillot', 'Argentine',
    'Charles de Gaulle – Étoile', 'George V', 'Franklin D. Roosevelt', 'Champs-Élysées – Clemenceau', 'Concorde',
    'Tuileries', 'Palais Royal – Musée du Louvre', 'Louvre – Rivoli', 'Châtelet', 'Hôtel de Ville', 'Saint-Paul',
    'Bastille', 'Gare de Lyon', 'Reuilly – Diderot', 'Nation', 'Porte de Vincennes', 'Saint-Mandé', 'Bérault',
    'Château de Vincennes']]],
  ['2', '#0055C8', '#fff', [[
    'Porte Dauphine', 'Victor Hugo', 'Charles de Gaulle – Étoile', 'Ternes', 'Courcelles', 'Monceau', 'Villiers',
    'Rome', 'Place de Clichy', 'Blanche', 'Pigalle', 'Anvers', 'Barbès – Rochechouart', 'La Chapelle', 'Stalingrad',
    'Jaurès', 'Colonel Fabien', 'Belleville', 'Couronnes', 'Ménilmontant', 'Père Lachaise', 'Philippe Auguste',
    'Alexandre Dumas', 'Avron', 'Nation']]],
  ['3', '#9F9825', '#fff', [[
    'Pont de Levallois – Bécon', 'Anatole France', 'Louise Michel', 'Porte de Champerret', 'Pereire', 'Wagram',
    'Malesherbes', 'Villiers', 'Europe', 'Saint-Lazare', 'Havre – Caumartin', 'Opéra', 'Quatre-Septembre', 'Bourse',
    'Sentier', 'Réaumur – Sébastopol', 'Arts et Métiers', 'Temple', 'République', 'Parmentier', 'Rue Saint-Maur',
    'Père Lachaise', 'Gambetta', 'Porte de Bagnolet', 'Gallieni']]],
  ['3bis', '#98D4E2', '#000', [[
    'Porte des Lilas', 'Saint-Fargeau', 'Pelleport', 'Gambetta']]],
  ['4', '#BB4D98', '#fff', [[
    'Porte de Clignancourt', 'Simplon', 'Marcadet – Poissonniers', 'Château Rouge', 'Barbès – Rochechouart',
    'Gare du Nord', "Gare de l'Est", "Château d'Eau", 'Strasbourg – Saint-Denis', 'Réaumur – Sébastopol',
    'Étienne Marcel', 'Les Halles', 'Châtelet', 'Cité', 'Saint-Michel', 'Odéon', 'Saint-Germain-des-Prés',
    'Saint-Sulpice', 'Saint-Placide', 'Montparnasse – Bienvenüe', 'Vavin', 'Raspail', 'Denfert-Rochereau',
    'Mouton-Duvernet', 'Alésia', "Porte d'Orléans", 'Mairie de Montrouge', 'Barbara', 'Bagneux – Lucie Aubrac']]],
  ['5', '#F28E42', '#000', [[
    'Bobigny – Pablo Picasso', 'Bobigny – Pantin – Raymond Queneau', 'Église de Pantin', 'Hoche', 'Porte de Pantin',
    'Ourcq', 'Laumière', 'Jaurès', 'Stalingrad', 'Gare du Nord', "Gare de l'Est", 'Jacques Bonsergent', 'République',
    'Oberkampf', 'Richard-Lenoir', 'Bréguet – Sabin', 'Bastille', 'Quai de la Rapée', "Gare d'Austerlitz",
    'Saint-Marcel', 'Campo-Formio', "Place d'Italie"]]],
  ['6', '#79BB92', '#000', [[
    'Charles de Gaulle – Étoile', 'Kléber', 'Boissière', 'Trocadéro', 'Passy', 'Bir-Hakeim', 'Dupleix',
    'La Motte-Picquet – Grenelle', 'Cambronne', 'Sèvres – Lecourbe', 'Pasteur', 'Montparnasse – Bienvenüe',
    'Edgar Quinet', 'Raspail', 'Denfert-Rochereau', 'Saint-Jacques', 'Glacière', 'Corvisart', "Place d'Italie",
    'Nationale', 'Chevaleret', 'Quai de la Gare', 'Bercy', 'Dugommier', 'Daumesnil', 'Bel-Air', 'Picpus', 'Nation']]],
  ['7', '#F3A4BA', '#000', [
    ['La Courneuve – 8 Mai 1945', "Fort d'Aubervilliers", 'Aubervilliers – Pantin – Quatre Chemins',
      'Porte de la Villette', 'Corentin Cariou', 'Crimée', 'Riquet', 'Stalingrad', 'Louis Blanc', 'Château-Landon',
      "Gare de l'Est", 'Poissonnière', 'Cadet', 'Le Peletier', 'Chaussée d\'Antin – La Fayette', 'Opéra', 'Pyramides',
      'Palais Royal – Musée du Louvre', 'Pont Neuf', 'Châtelet', 'Pont Marie', 'Sully – Morland', 'Jussieu',
      'Place Monge', 'Censier – Daubenton', 'Les Gobelins', "Place d'Italie", 'Tolbiac', 'Maison Blanche'],
    ["Porte d'Italie", 'Le Kremlin-Bicêtre', 'Villejuif – Léo Lagrange', 'Villejuif – Paul Vaillant-Couturier',
      'Villejuif – Louis Aragon'],
    ['Porte de Choisy', "Porte d'Ivry", 'Pierre et Marie Curie', "Mairie d'Ivry"]]],
  ['7bis', '#83C491', '#000', [[
    'Louis Blanc', 'Jaurès', 'Bolivar', 'Buttes Chaumont', 'Botzaris', 'Place des Fêtes', 'Pré-Saint-Gervais',
    'Danube']]],
  ['8', '#C5A3CA', '#000', [[
    'Balard', 'Lourmel', 'Boucicaut', 'Félix Faure', 'Commerce', 'La Motte-Picquet – Grenelle', 'École Militaire',
    'La Tour-Maubourg', 'Invalides', 'Concorde', 'Madeleine', 'Opéra', 'Richelieu – Drouot', 'Grands Boulevards',
    'Bonne Nouvelle', 'Strasbourg – Saint-Denis', 'République', 'Filles du Calvaire', 'Saint-Sébastien – Froissart',
    'Chemin Vert', 'Bastille', 'Ledru-Rollin', 'Faidherbe – Chaligny', 'Reuilly – Diderot', 'Montgallet',
    'Daumesnil', 'Michel Bizot', 'Porte Dorée', 'Porte de Charenton', 'Liberté', 'Charenton – Écoles',
    'École Vétérinaire de Maisons-Alfort', 'Maisons-Alfort – Stade', 'Maisons-Alfort – Les Juilliottes',
    "Créteil – L'Échat", 'Créteil – Université', 'Créteil – Préfecture', 'Pointe du Lac']]],
  ['9', '#B6BD00', '#000', [[
    'Pont de Sèvres', 'Billancourt', 'Marcel Sembat', 'Porte de Saint-Cloud', 'Exelmans', 'Michel-Ange – Molitor',
    'Michel-Ange – Auteuil', 'Jasmin', 'Ranelagh', 'La Muette', 'Rue de la Pompe', 'Trocadéro', 'Iéna',
    'Alma – Marceau', 'Franklin D. Roosevelt', 'Saint-Philippe du Roule', 'Miromesnil', 'Saint-Augustin',
    'Havre – Caumartin', "Chaussée d'Antin – La Fayette", 'Richelieu – Drouot', 'Grands Boulevards', 'Bonne Nouvelle',
    'Strasbourg – Saint-Denis', 'République', 'Oberkampf', 'Saint-Ambroise', 'Voltaire', 'Charonne',
    'Rue des Boulets', 'Nation', 'Buzenval', 'Maraîchers', 'Porte de Montreuil', 'Robespierre', 'Croix de Chavaux',
    'Mairie de Montreuil']]],
  ['10', '#E3B32A', '#000', [[
    'Boulogne – Pont de Saint-Cloud', 'Boulogne – Jean Jaurès', "Porte d'Auteuil", 'Michel-Ange – Molitor',
    'Michel-Ange – Auteuil', "Église d'Auteuil", 'Chardon-Lagache', 'Mirabeau', 'Javel – André Citroën',
    'Charles Michels', 'Avenue Émile Zola', 'La Motte-Picquet – Grenelle', 'Ségur', 'Duroc', 'Vaneau',
    'Sèvres – Babylone', 'Mabillon', 'Odéon', 'Cluny – La Sorbonne', 'Maubert – Mutualité', 'Cardinal Lemoine',
    'Jussieu', "Gare d'Austerlitz"]]],
  ['11', '#8D5E2A', '#fff', [[
    'Rosny-Bois-Perrier', 'Coteaux Beauclair', 'La Dhuys', 'Montreuil – Hôpital', 'Romainville – Carnot',
    'Serge Gainsbourg', 'Mairie des Lilas', 'Porte des Lilas', 'Télégraphe', 'Place des Fêtes', 'Jourdain',
    'Pyrénées', 'Belleville', 'Goncourt', 'République', 'Arts et Métiers', 'Rambuteau', 'Hôtel de Ville',
    'Châtelet']]],
  ['12', '#00814F', '#fff', [[
    "Mairie d'Aubervilliers", 'Aimé Césaire', 'Front Populaire', 'Porte de la Chapelle', 'Marx Dormoy',
    'Marcadet – Poissonniers', 'Jules Joffrin', 'Lamarck – Caulaincourt', 'Abbesses', 'Pigalle', 'Saint-Georges',
    'Notre-Dame-de-Lorette', "Trinité – d'Estienne d'Orves", 'Saint-Lazare', 'Madeleine', 'Concorde',
    'Assemblée nationale', 'Solférino', 'Rue du Bac', 'Sèvres – Babylone', 'Rennes', 'Notre-Dame-des-Champs',
    'Montparnasse – Bienvenüe', 'Falguière', 'Pasteur', 'Volontaires', 'Vaugirard', 'Convention',
    'Porte de Versailles', 'Corentin Celton', "Mairie d'Issy"]]],
  ['13', '#98D4E2', '#000', [
    ['Châtillon – Montrouge', 'Malakoff – Rue Étienne Dolet', 'Malakoff – Plateau de Vanves', 'Porte de Vanves',
      'Plaisance', 'Pernety', 'Gaîté', 'Montparnasse – Bienvenüe', 'Duroc', 'Saint-François-Xavier', 'Varenne',
      'Invalides', 'Champs-Élysées – Clemenceau', 'Miromesnil', 'Saint-Lazare', 'Liège', 'Place de Clichy',
      'La Fourche'],
    ['Brochant', 'Porte de Clichy', 'Mairie de Clichy', 'Gabriel Péri', 'Les Agnettes',
      'Asnières – Gennevilliers – Les Courtilles'],
    ['Guy Môquet', 'Porte de Saint-Ouen', 'Garibaldi', 'Mairie de Saint-Ouen', 'Carrefour Pleyel',
      'Saint-Denis – Porte de Paris', 'Basilique de Saint-Denis', 'Saint-Denis – Université']]],
  ['14', '#62259D', '#fff', [[
    'Saint-Denis – Pleyel', 'Saint-Ouen', 'Mairie de Saint-Ouen', 'Porte de Clichy', 'Pont Cardinet', 'Saint-Lazare',
    'Madeleine', 'Pyramides', 'Châtelet', 'Gare de Lyon', 'Bercy', 'Cour Saint-Émilion',
    'Bibliothèque François Mitterrand', 'Olympiades', 'Maison Blanche', 'Hôpital Bicêtre',
    'Villejuif – Gustave Roussy', "L'Haÿ-les-Roses", 'Chevilly-Larue', 'Thiais – Orly', "Aéroport d'Orly"]]],
];

const RARITIES = [
  { id: 'commune', label: 'Commune', weight: 58, scrap: 2, color: '#9aa4b2' },
  { id: 'peu-commune', label: 'Peu commune', weight: 26, scrap: 6, color: '#4fc27a' },
  { id: 'rare', label: 'Rare', weight: 10, scrap: 20, color: '#4aa3ff' },
  { id: 'super-rare', label: 'Super rare', weight: 4.2, scrap: 60, color: '#b66bff' },
  { id: 'legendaire', label: 'Légendaire', weight: 0.8, scrap: 200, color: '#ffc531' },
];

function slug(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function rarityFor(nbLines) {
  if (nbLines >= 5) return 'legendaire';
  if (nbLines === 4) return 'super-rare';
  if (nbLines === 3) return 'rare';
  if (nbLines === 2) return 'peu-commune';
  return 'commune';
}

const LINES = {};
const STATIONS = {};
const NETWORKS = [
  { id: 'metro', label: 'Métro' }, { id: 'rer', label: 'RER' },
  { id: 'transilien', label: 'Transilien' }, { id: 'tram', label: 'Tramway' },
];
for (const [id, color, text, routes, network = 'metro'] of [...LINE_DEFS, ...require('./lines-extra')]) {
  LINES[id] = { id, color, text, network, routes: routes.map((r) => r.map(slug)) };
  for (const route of routes) {
    for (const name of route) {
      const sid = slug(name);
      const st = (STATIONS[sid] ||= { id: sid, name, lines: [] });
      if (!st.lines.includes(id)) st.lines.push(id);
    }
  }
}
for (const st of Object.values(STATIONS)) {
  st.rarity = rarityFor(st.lines.length);
  // les gares du métro sortent plus souvent que celles des autres réseaux
  st.weight = st.lines.some((l) => LINES[l].network === 'metro') ? 3 : 1;
}

const BY_RARITY = {};
for (const r of RARITIES) BY_RARITY[r.id] = [];
for (const st of Object.values(STATIONS)) BY_RARITY[st.rarity].push(st.id);

function catalog() {
  return {
    rarities: RARITIES,
    achievements: require('./achievements').ACHIEVEMENTS.map(({ id, title, desc, reward }) => ({ id, title, desc, reward })),
    networks: NETWORKS,
    lines: LINES,
    stations: Object.values(STATIONS),
  };
}

module.exports = { LINES, STATIONS, RARITIES, BY_RARITY, slug, catalog };
