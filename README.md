# MetroMaster 🚇

Jeu de cartes à collectionner : les cartes sont les ~320 stations du métro parisien.

- **1 paquet de 5 gares par heure** (5 paquets de 5 gares en stock maximum).
- **Raretés** selon le nombre de lignes : 1 = commune, 2 = peu commune, 3 = rare, 4 = super rare, 5 = légendaire (Châtelet, République).
- **Lignes** : avancement de chaque ligne en fonction des gares possédées.
- **Navigos** (monnaie) : 0 au départ (à gagner en défaussant des gares et via les succès) ; « défausser » une gare contre des Navigos ; **enchères de 10 min à 24 h** (5 max par joueur, sans frais) avec prix minimum, surenchère ≥ 5 %, **prix moyen de vente** par gare.
- Comptes (pseudo + mot de passe) pour sauvegarder la progression ; PWA installable (iPhone, Android, PC).

## Lancer en local
```
npm run dev      # http://localhost:3000 (données dans .data/db.json)
npm test
```

## Déployer sur Vercel
1. Importer le dépôt sur Vercel (aucun build nécessaire).
2. Variables d'environnement :
   - `AUTH_SECRET` : longue chaîne aléatoire (signature des sessions) — **obligatoire**.
   - Base de données : ajouter l'intégration **Upstash Redis** (Marketplace) ; elle fournit `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` / `_TOKEN`).
   **Sans Redis, toute la progression est perdue à chaque déploiement** (l'app affiche alors un bandeau d'avertissement) (`/api/health` renvoie `persistent:false`).

## Structure
`api/[...path].js` (API) · `lib/` (données métro, logique de jeu, stockage, auth) · `public/` (front PWA) · `test/`
