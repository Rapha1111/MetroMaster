# MetroMaster 🚇

Jeu de cartes à collectionner : les cartes sont les ~320 stations du métro parisien.

- **1 gare débloquée par heure** (stock de 24 max si tu ne te connectes pas).
- **Raretés** selon le nombre de lignes : 1 = commune, 2 = peu commune, 3 = rare, 4 = super rare, 5 = légendaire (Châtelet, République).
- **Lignes** : avancement de chaque ligne en fonction des gares possédées.
- **Navigos** (monnaie) : 100 au départ ; « défoncer » une gare contre des Navigos ; **enchères de 24 h** avec prix minimum, surenchère ≥ 5 %, 5 % de frais vendeur, **prix moyen de vente** par gare.
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
   Sans Redis, les données sont en mémoire et perdues régulièrement (`/api/health` renvoie `persistent:false`).

## Structure
`api/[...path].js` (API) · `lib/` (données métro, logique de jeu, stockage, auth) · `public/` (front PWA) · `test/`
