'use strict';
// RER, Transilien et tramway. Même format que LINE_DEFS : [id, couleur, texte, trajets, réseau].
// Les gares en correspondance avec le métro portent EXACTEMENT le même nom que dans metro.js
// (elles fusionnent alors en une seule carte, plus rare).
// Données saisies de mémoire : certaines gares de grande couronne peuvent être à corriger.

module.exports = [
  // ───────────── RER ─────────────
  ['A', '#E2231A', '#fff', [
    ['Nanterre – Préfecture', 'La Défense', 'Charles de Gaulle – Étoile', 'Auber', 'Châtelet', 'Gare de Lyon', 'Nation'],
    ['Nanterre – Université', 'Rueil-Malmaison', 'Chatou – Croissy', 'Le Vésinet – Le Pecq', 'Le Vésinet – Centre', 'Saint-Germain-en-Laye'],
    ['Nanterre – Ville', 'Houilles – Carrières-sur-Seine', 'Sartrouville', 'Maisons-Laffitte', 'Achères – Grand-Cormier', 'Poissy'],
    ['Achères – Ville', 'Neuville – Université', 'Cergy – Saint-Christophe', 'Cergy – Préfecture', 'Cergy-le-Haut'],
    ['Vincennes', 'Fontenay-sous-Bois', 'Nogent-sur-Marne', 'Joinville-le-Pont', 'Saint-Maur – Créteil', 'Le Parc de Saint-Maur', 'Champigny',
      'La Varenne – Chennevières', 'Sucy – Bonneuil', 'Boissy-Saint-Léger'],
    ['Neuilly-Plaisance', 'Bry-sur-Marne', "Noisy-le-Grand – Mont d'Est", 'Noisy – Champs', 'Noisiel', 'Lognes', 'Torcy', 'Bussy-Saint-Georges',
      "Val d'Europe", 'Marne-la-Vallée – Chessy']], 'rer'],
  ['B', '#4B92DB', '#fff', [
    ['Aéroport Charles de Gaulle 2 – TGV', 'Aéroport Charles de Gaulle 1', 'Parc des Expositions', 'Villepinte', 'Sevran – Beaudottes',
      'Aulnay-sous-Bois', 'Le Blanc-Mesnil', 'Drancy', 'Le Bourget', 'La Courneuve – Aubervilliers', 'La Plaine – Stade de France', 'Gare du Nord',
      'Châtelet', 'Saint-Michel', 'Luxembourg', 'Port-Royal', 'Denfert-Rochereau', 'Cité Universitaire', 'Gentilly', 'Laplace', 'Arcueil – Cachan',
      'Bagneux', 'Bourg-la-Reine'],
    ['Sevran – Livry', 'Vert-Galant', 'Villeparisis – Mitry-le-Neuf', 'Mitry – Claye'],
    ['Sceaux', 'Fontaine-Michalon', 'Robinson'],
    ['Parc de Sceaux', 'La Croix de Berny', 'Antony', 'Les Baconnets', 'Massy – Verrières', 'Massy – Palaiseau', 'Palaiseau', 'Lozère', 'Le Guichet',
      'Orsay-Ville', 'Bures-sur-Yvette', 'La Hacquinière', 'Gif-sur-Yvette', 'Courcelle-sur-Yvette', 'Saint-Rémy-lès-Chevreuse']], 'rer'],
  ['C', '#F6C700', '#000', [
    ["Gare d'Austerlitz", 'Saint-Michel', "Musée d'Orsay", 'Invalides', "Pont de l'Alma", 'Champ de Mars – Tour Eiffel'],
    ['Javel – André Citroën', 'Issy – Val de Seine', 'Issy', 'Meudon – Val Fleury', 'Chaville – Rive Gauche', 'Viroflay – Rive Gauche',
      'Versailles – Château Rive Gauche'],
    ['Kennedy – Radio France', 'Boulainvilliers', 'Avenue Henri-Martin', 'Avenue Foch', 'Porte Maillot', 'Pereire – Levallois', 'Porte de Clichy',
      'Saint-Ouen', 'Les Grésillons', 'Gennevilliers', 'Épinay-sur-Seine', 'Saint-Gratien', 'Ermont – Eaubonne', 'Cernay', 'Franconville – Le Plessis-Bouchard',
      'Montigny – Beauchamp', 'Pierrelaye', "Saint-Ouen-l'Aumône", "Saint-Ouen-l'Aumône – Liesse", 'Pontoise'],
    ['Bibliothèque François Mitterrand', 'Ivry-sur-Seine', 'Vitry-sur-Seine', 'Les Ardoines', 'Choisy-le-Roi', 'Villeneuve-Triage',
      'Villeneuve-Saint-Georges', 'Juvisy', 'Savigny-sur-Orge', 'Épinay-sur-Orge', 'Sainte-Geneviève-des-Bois', 'Saint-Michel-sur-Orge',
      'Brétigny', 'Marolles-en-Hurepoix', 'Bouray', 'Lardy', 'Chamarande', 'Étréchy', 'Étampes'],
    ['Saint-Chéron', 'Sermaise', 'Dourdan', 'Dourdan-la-Forêt'],
    ["Pont de Rungis – Aéroport d'Orly", 'Rungis – La Fraternelle', "Chemin d'Antony", 'Massy – Verrières', 'Massy – Palaiseau', 'Igny', 'Bièvres',
      'Petit-Jouy – Les Loges', 'Jouy-en-Josas', 'Chaville – Vélizy', 'Versailles-Chantiers']], 'rer'],
  ['D', '#3F9C35', '#fff', [
    ['Gare du Nord', 'Châtelet', 'Gare de Lyon', 'Maisons-Alfort – Alfortville', 'Le Vert de Maisons', 'Créteil – Pompadour',
      'Villeneuve-Saint-Georges', 'Vigneux-sur-Seine', 'Juvisy'],
    ['Stade de France – Saint-Denis', 'Saint-Denis', 'Pierrefitte – Stains', 'Garges – Sarcelles', 'Villiers-le-Bel – Gonesse – Arnouville',
      'Goussainville', 'Les Noues', 'Survilliers – Fosses', 'Orry-la-Ville – Coye', 'Chantilly – Gouvieux', 'Creil'],
    ['Viry-Châtillon', 'Ris-Orangis', 'Grigny-Centre', 'Orangis – Bois de l\'Épine', 'Évry – Courcouronnes', 'Évry – Bras de Fer – Génopole',
      'Corbeil-Essonnes', 'Moulin-Galant', 'Mennecy', 'Ballancourt', 'La Ferté-Alais', 'Boutigny', 'Maisse', 'Buno-Gironville', 'Boigneville', 'Malesherbes'],
    ['Grand Vaux', 'Savigny-le-Temple – Nandy', 'Cesson', 'Le Mée', 'Melun']], 'rer'],
  ['E', '#B14C9B', '#fff', [
    ['Saint-Lazare', 'Magenta', 'Gare du Nord', 'Rosa Parks', 'Pantin', 'Noisy-le-Sec', 'Bondy', 'Rosny-Bois-Perrier', 'Rosny-sous-Bois',
      'Val de Fontenay', 'Nogent – Le Perreux', 'Les Boullereaux – Champigny', 'Villiers-sur-Marne – Le Plessis-Trévise',
      'Les Yvris – Noisy-le-Grand', 'Émerainville – Pontault-Combault', 'Roissy-en-Brie', 'Ozoir-la-Ferrière', 'Gretz-Armainvilliers', 'Tournan'],
    ['Gagny', 'Le Chénay-Gagny', 'Chelles – Gournay']], 'rer'],

  // ───────────── TRANSILIEN ─────────────
  ['H', '#8D5E2A', '#fff', [
    ['Gare du Nord', 'Saint-Denis', 'Épinay-Villetaneuse', 'Pierrefitte – Stains', 'Garges – Sarcelles', 'Sarcelles – Saint-Brice', 'Écouen – Ézanville',
      'Domont', 'Bouffémont – Moisselles', 'Montsoult – Maffliers', 'Presles – Courcelles', 'Persan – Beaumont'],
    ['Luzarches', 'Seugy', 'Belloy – Saint-Martin'],
    ['Ermont – Eaubonne', 'Saint-Leu-la-Forêt', 'Taverny', 'Bessancourt', 'Pierrelaye', 'Pontoise']], 'transilien'],
  ['J', '#C7D32F', '#000', [
    ['Saint-Lazare', 'Pont Cardinet', 'Clichy – Levallois', 'Asnières-sur-Seine', 'Bois-Colombes', 'Colombes', 'Argenteuil', 'Val d\'Argenteuil',
      'Cormeilles-en-Parisis', 'Herblay', 'Conflans – Fin d\'Oise', 'Éragny – Neuville', 'Pontoise', 'Osny', 'Montgeroult – Courcelles', 'Gisors'],
    ['Épône – Mézières', 'Aubergenville – Élisabethville', 'Mantes-la-Jolie', 'Vernon – Giverny', 'Les Mureaux', 'Meulan – Hardricourt', 'Juziers'],
    ['Vaucelles', 'Montigny-Beauchamp', 'Vernouillet – Verneuil', 'Ermont – Eaubonne']], 'transilien'],
  ['K', '#9B993E', '#fff', [
    ['Gare du Nord', 'Aulnay-sous-Bois', 'Sevran – Livry', 'Villepinte', 'Vert-Galant', 'Villeparisis – Mitry-le-Neuf', 'Mitry – Claye', 'Compans',
      'Dammartin – Juilly – Saint-Mard', 'Le Plessis-Belleville', 'Nanteuil-le-Haudouin', 'Crépy-en-Valois']], 'transilien'],
  ['L', '#C5A3CA', '#000', [
    ['Saint-Lazare', 'Pont Cardinet', 'Clichy – Levallois', 'Asnières-sur-Seine', 'Bois-Colombes', 'Colombes', 'La Garenne-Colombes', 'La Défense', 'Puteaux',
      'Suresnes – Mont-Valérien', 'Saint-Cloud', 'Garches – Marnes-la-Coquette', 'Vaucresson', 'Le Val d\'Or', 'Saint-Nom-la-Bretèche'],
    ['Sèvres – Ville-d\'Avray', 'Ville-d\'Avray', 'Versailles – Rive Droite'],
    ['Nanterre – Université', 'Houilles – Carrières-sur-Seine', 'Sartrouville', 'Cormeilles-en-Parisis', 'Ermont – Eaubonne', 'Cergy-le-Haut']], 'transilien'],
  ['N', '#00A88F', '#fff', [
    ['Montparnasse – Bienvenüe', 'Vanves – Malakoff', 'Clamart', 'Meudon', 'Bellevue', 'Sèvres – Rive Gauche', 'Chaville – Vélizy', 'Viroflay – Rive Gauche',
      'Versailles-Chantiers', 'Saint-Cyr', 'Trappes', 'La Verrière', 'Montigny-le-Bretonneux', 'Saint-Quentin-en-Yvelines', 'Coignières', 'Les Essarts-le-Roi',
      'Le Perray', 'Rambouillet', 'Gazeran', 'Épernon', 'Maintenon', 'Chartres'],
    ['Villepreux – Les Clayes', 'Les Clayes-sous-Bois', 'Plaisir – Les Clayes', 'Plaisir – Grignon', 'Villiers-Neauphle-Pontchartrain',
      'Garancières – La Queue', 'Orgerus – Behoust', 'Montfort-l\'Amaury – Méré', 'Houdan', 'Dreux']], 'transilien'],
  ['P', '#F28E42', '#000', [
    ["Gare de l'Est", 'Noisy-le-Sec', 'Bondy', 'Le Raincy – Villemomble – Montfermeil', 'Gagny', 'Chelles – Gournay', 'Vaires – Torcy', 'Lagny – Thorigny',
      'Esbly', 'Montry – Condé', 'Meaux', 'Trilport', 'Changis – Saint-Jean', 'La Ferté-sous-Jouarre', 'Nanteuil – Saâcy', 'Château-Thierry'],
    ['Couilly – Saint-Germain – Quincy', 'Crécy-la-Chapelle', 'Villiers-sur-Morin', 'Faremoutiers – Pommeuse', 'Mouroux', 'Coulommiers'],
    ['Longueville', 'Verneuil-l\'Étang', 'Mormant', 'Nangis', 'Provins']], 'transilien'],
  ['R', '#F49FB6', '#000', [
    ['Gare de Lyon', 'Villeneuve-Saint-Georges', 'Montgeron – Crosne', 'Yerres', 'Brunoy', 'Combs-la-Ville – Quincy', 'Lieusaint – Moissy',
      'Savigny-le-Temple – Nandy', 'Cesson', 'Le Mée', 'Melun', 'Bois-le-Roi', 'Fontainebleau – Avon', 'Thomery', 'Moret – Veneux-les-Sablons',
      'Saint-Mammès', 'Montereau', 'Nemours – Saint-Pierre', 'Montargis']], 'transilien'],
  ['U', '#B6104E', '#fff', [
    ['La Défense', 'Puteaux', 'Suresnes – Mont-Valérien', 'Saint-Cloud', 'Sèvres – Ville-d\'Avray', 'Chaville – Vélizy', 'Viroflay – Rive Gauche',
      'Versailles-Chantiers', 'Saint-Cyr', 'La Verrière']], 'transilien'],

  // ───────────── TRAMWAY ─────────────
  ['T1', '#0F5BA7', '#fff', [
    ['Asnières – Quatre Routes', 'Asnières – Gennevilliers – Les Courtilles', 'Les Grésillons', 'Gabriel Péri', 'Gare de Gennevilliers', 'Basilique de Saint-Denis',
      'Théâtre Gérard Philipe', 'Marché de Saint-Denis', 'Saint-Denis – Porte de Paris', 'Hôpital Delafontaine', 'Drancy – Avenir', 'La Courneuve – 6 Routes',
      'Hôpital Avicenne', 'Bobigny – Pablo Picasso', 'Bobigny – Pantin – Raymond Queneau', 'Libération', 'Hôpital Jean Verdier', 'Les Coquetiers',
      'Petit Noisy', 'Noisy-le-Sec', 'Hôtel de Ville de Rosny', 'Rosny-Bois-Perrier', 'Val de Fontenay']], 'tram'],
  ['T2', '#C04191', '#fff', [
    ['La Défense', 'Puteaux', 'Belvédère', 'Suresnes – Longchamp', 'Les Coteaux', 'Les Milons', 'Parc de Saint-Cloud', 'Musée de Sèvres', 'Brimborion',
      'Meudon-sur-Seine', 'Les Moulineaux', 'Jacques-Henri Lartigue', 'Issy – Val de Seine', 'Porte de Versailles']], 'tram'],
  ['T3a', '#F28E42', '#000', [
    ['Pont du Garigliano', 'Balard', 'Desnouettes', 'Porte de Versailles', 'Georges Brassens', 'Brancion', 'Porte de Vanves', 'Didot', 'Jean Moulin',
      "Porte d'Orléans", 'Montsouris – Université', 'Porte de Gentilly', 'Poterne des Peupliers', "Porte d'Italie", 'Porte de Choisy', "Porte d'Ivry",
      'Boulevard Masséna', 'Alexandra David-Néel', 'Porte de Vitry', 'Maryse Bastié', 'Porte de Charenton', 'Porte Dorée', 'Montempoivre', 'Porte de Vincennes']], 'tram'],
  ['T3b', '#00814F', '#fff', [
    ['Porte de Vincennes', 'Porte de Montreuil', 'Porte de Bagnolet', 'Séverine', 'Porte des Lilas', 'Porte de Pantin', 'Ella Fitzgerald',
      "Porte de la Villette", "Porte d'Aubervilliers", 'Porte de la Chapelle', 'Évangile', 'Marie de Miribel', 'Porte de Clignancourt',
      'Porte de Saint-Ouen', 'Porte de Clichy', "Porte d'Asnières", 'Porte Maillot']], 'tram'],
  ['T4', '#E3B32A', '#000', [
    ['Aulnay-sous-Bois', 'Hôpital Robert Ballanger', 'Freinville – Sevran', 'Sevran – Beaudottes', 'Allée de la Remise', 'Rougemont – Chanteloup',
      'Montfermeil', 'Clichy-sous-Bois', 'Les Pavillons-sous-Bois', 'Gargan', 'Le Raincy – Villemomble – Montfermeil']], 'tram'],
  ['T5', '#6A3F95', '#fff', [
    ['Saint-Denis – Marché', 'Cosmonautes', 'Pierrefitte – Stains', 'Garges – Sarcelles', 'Les Doucettes', 'Sarcelles – Saint-Brice', 'Sarcelles – Lochères',
      'Villiers-le-Bel – Gonesse – Arnouville', 'Garges – Sarcelles RER', 'Saint-Denis']], 'tram'],
  ['T6', '#E2231A', '#fff', [
    ['Châtillon – Montrouge', 'Châtillon – Les Mouilleboeufs', 'Mairie de Clamart', 'Clamart – Hôpital Béclère', 'Malabry', 'Robinson', 'Vélizy 2',
      'Vélizy – Pôle Tertiaire', 'Viroflay – Rive Droite', 'Viroflay – Rive Gauche']], 'tram'],
  ['T7', '#8D5E2A', '#fff', [
    ['Villejuif – Louis Aragon', 'Villejuif – Gustave Roussy', 'Hôpital Paul Brousse', 'Les Aqueducs', 'Chevilly-Larue', 'Thiais – Orly', 'Orly-Ville',
      "Aéroport d'Orly", 'Fort d\'Issy', 'Sénia', 'Rungis – La Fraternelle', 'Porte de Thiais', 'Marché International', 'Les Antes', 'Paul Hochart',
      "Chevilly – Trois Communes", "Rouget de Lisle", 'Athis-Mons']], 'tram'],
  ['T8', '#C5A3CA', '#000', [
    ['Saint-Denis', 'Delaunay-Belleville', 'Saint-Denis – Porte de Paris', 'Marché de Saint-Denis', 'Basilique de Saint-Denis', 'Épinay-sur-Seine',
      'Gare d\'Épinay – Orgemont', 'Épinay – Villetaneuse', 'Villetaneuse – Université', 'Pierrefitte – Stains', 'Garges – Sarcelles', 'Sarcelles – Saint-Brice']], 'tram'],
  ['T9', '#E3B32A', '#000', [
    ['Porte de Choisy', 'Ancienne Mairie', 'Hôtel de Ville de Vitry', 'Vitry – Centre', 'Maurice Thorez', 'Les Ardoines', 'Mairie d\'Ivry',
      'Choisy-le-Roi', 'Orly – Gaston Viens', 'Georges Méliès', 'Rouget de Lisle', 'Athis-Mons', 'Louis Lumière']], 'tram'],
  ['T10', '#79BB92', '#000', [
    ['Antony', 'Croix de Berny', 'Hôpital Béclère', 'Le Plessis-Robinson', 'Cité du Plessis-Pâté', 'Place du Garde', 'Clos Montholon', 'Jean Jaurès',
      'Hôtel de Ville de Clamart', 'Pierre Brossolette', 'Robinson']], 'tram'],
  ['T11', '#F28E42', '#000', [
    ['Épinay-sur-Seine', 'Épinay – Villetaneuse', 'Villetaneuse – Université', 'Dugny – La Courneuve', 'Le Bourget', 'Le Bourget – RER', 'Le Blanc-Mesnil',
      'Sevran – Beaudottes']], 'tram'],
  ['T12', '#4B92DB', '#fff', [
    ['Massy – Palaiseau', 'Massy – Opéra', 'Massy – Europe', 'Camille Desmoulins', 'Les Ulis', 'Palaiseau', 'Épinay-sur-Orge', 'Évry – Courcouronnes',
      'Grigny-Centre', 'Savigny-sur-Orge', 'Juvisy', 'Athis-Mons', 'Viry-Châtillon', 'Ris-Orangis', 'Évry – Bras de Fer – Génopole']], 'tram'],
  ['T13', '#8D5E2A', '#fff', [
    ['Saint-Cyr', 'Saint-Germain-en-Laye', 'Hôpital de Poissy', 'Poissy', 'Achères – Ville', 'Les Mureaux', 'Cergy – Préfecture', 'Cergy-le-Haut',
      'Villepreux – Les Clayes', 'Noisy – Champs', 'Noisiel', 'Torcy', 'Lognes']], 'tram'],
];
