# BoutikDigit

BoutikDigit est une application Next.js 16 orientee marketplace locale: elle permet d'afficher des boutiques, consulter des produits, gerer un panier, passer des commandes et administrer le contenu selon le role utilisateur.

## Installation

### Prerequis
- Node.js 20+ (recommande)
- npm
- Une base MySQL

### Etapes
1. Cloner le projet et ouvrir le dossier.
2. Installer les dependances: `npm install`
3. Copier le modele de configuration des variables: copier `.env.example` en `.env` (PowerShell: `Copy-Item .env.example .env` ; macOS/Linux: `cp .env.example .env`), puis remplir les valeurs (voir [Variables d'environnement](#variables-denvironnement) ci-dessous).
4. Generer le client Prisma: `npm run db:generate`
5. Synchroniser la base: `npm run db:push`
6. Lancer le serveur de dev: `npm run dev`

### Variables d'environnement

Le detail par variable est dans **`.env.example`**. Synthese:

| Variable | Obligatoire | Role |
|----------|------------|------|
| `DATABASE_URL` | Oui (Prisma) | Chaine de connexion MySQL pour Prisma. |
| `NEXTAUTH_URL` | Fortement conseille (NextAuth) | URL publique de l'application (ex. `http://localhost:3000` en local, ou l'URL HTTPS en production). |
| `NEXTAUTH_SECRET` | Oui en production | Secret de signature des sessions / JWT NextAuth. Generer une valeur aleatoire longue (ex. `openssl rand -base64 32`). En dev, une valeur de secours existe dans le code si la variable est absente. |
| `CLOUDINARY_CLOUD_NAME` | Oui si uploads images | Compte [Cloudinary](https://cloudinary.com/) : logo, banniere boutique, photos produit via le dashboard marchand. |
| `CLOUDINARY_API_KEY` | Oui si uploads | Cle API Cloudinary. |
| `CLOUDINARY_API_SECRET` | Oui si uploads | Secret API Cloudinary. |

Sans les trois variables Cloudinary, l'app fonctionne (catalogue, commandes, avis) mais **les routes d'upload d'images** echoueront.

## Etat actuel du projet

### Stack technique
- Framework: `Next.js` (App Router) + `React` + `TypeScript`
- UI: `Tailwind CSS v4`, composants `shadcn/ui` (Radix), `framer-motion`, `sonner`
- Donnees: `Prisma` + `MySQL`
- Authentification: `next-auth` (credentials, sessions JWT)
- Medias: `Cloudinary` (uploads logo / banniere / images produit, dossier `boutikdigit/{boutique}/`)
- State management: `Zustand` (app, auth, panier, favoris)

### Structure actuelle (apres reorganisation)
- `app/`: dossier principal App Router a la racine
  - `app/layout.tsx`, `app/page.tsx`
  - `app/api/**/route.ts` (API shops, products, orders, auth, admin, seed)
- `components/`: composants UI et vues metier
- `store/`: stores Zustand
- `lib/`: utilitaires, DB, auth
- `hooks/`: hooks partages
- `types/`: extensions de types (notamment NextAuth)
- `prisma/`: schema et gestion de base
- `public/`: assets statiques

### Fonctionnement applicatif principal
- L'interface cliente principale est rendue via `app/page.tsx`.
- Routes App Router: `/`, `/shop/[id]`, `/cart`, `/favorites`, `/orders`, `/dashboard` (marchand), `/admin`, `/login`, `/register` ; etat partage via Zustand.
- Donnees et actions via `app/api/*` (commandes, promotions, avis, uploads).
- Prisma: utilisateurs, boutiques (logo, banniere), produits, images produit, commandes, codes promo, avis boutique et avis produit.
- Checkout: champ code promo, validation cote `POST /api/orders` avec remise sur le total.

## Usage

### En local
- Demarrer l'application: `npm run dev`
- Parcourir les routes principales:
  - `/` (accueil)
  - `/shop/[id]` (detail boutique)
  - `/cart`, `/favorites`, `/orders`
  - `/login`, `/register`
  - `/dashboard` (marchand), `/admin` (admin)

### Scripts utiles
- `npm run dev` : lancer l'application en local
- `npm run build` : compiler l'application
- `npm run start` : executer la version build
- `npm run lint` : verifier le lint
- `npm run db:push` : synchroniser le schema Prisma
- `npm run db:generate` : generer le client Prisma
- `npm run db:migrate` : lancer une migration Prisma
- `npm run db:reset` : reinitialiser la base (attention: destructif)

## API

Les endpoints sont exposes via App Router dans `app/api/**/route.ts`.

### Endpoints principaux
- `POST /api/auth/register` : inscription
- `GET/POST /api/auth/[...nextauth]` : NextAuth (session / credentials)
- `GET /api/shops` , `GET/PATCH/DELETE /api/shops/[id]` : boutiques
- `GET/POST /api/products` , `GET/PATCH/DELETE /api/products/[id]` : produits
- `GET/POST /api/orders` : commandes (support `promoCode` dans le corps POST)
- `GET/POST /api/promotions` : codes promo (marchand)
- `GET/POST /api/reviews/shops` , `GET/POST /api/reviews/products` : avis
- `POST /api/uploads/cloudinary` : upload d'image (marchand / admin, base64)
- `GET /api/admin` : admin
- `GET /api/seed` : donnees de test (dev)

### Bonnes pratiques recommandees
- Valider toutes les entrees (Zod)
- Normaliser les erreurs API (format unique)
- Ajouter des controles de role centralises (admin/marchand/client)
- Documenter les schemas de requete/reponse (OpenAPI ou Markdown)

## Ameliorations prioritaires recommandees

1. **Consolider la migration vers App Router**
   - Poursuivre l'alignement de tous les flux et gardes d'acces autour des routes dediees (`/shop/[id]`, `/cart`, `/dashboard`, etc.) pour SEO, partage d'URL, analytics et maintenabilite.
2. **Durcir la securite**
   - Deplacer tous les secrets vers des variables d'environnement.
   - Verifier les validations Zod sur toutes les entrees API et harmoniser les erreurs.
3. **Renforcer la qualite logicielle**
   - Ajouter des tests unitaires/integration (API + stores + composants critiques).
   - Activer une CI simple (lint + typecheck + tests).
4. **Mieux segmenter le domaine metier**
   - Introduire une structure plus explicite par domaine (`features/shops`, `features/orders`, etc.) pour eviter un `components/views` trop central.
5. **Revoir la config de build**
   - Eviter de masquer des erreurs TypeScript en production (si active dans la config Next), et traiter les erreurs a la source.

## Fonctionnalites/composants a ajouter

- Historique detaille des commandes client (filtres, statut, suivi).
- Tableau de bord marchand plus complet (KPIs, ventes, produits les plus commandes).
- Upload/optimisation images produit avec contraintes de format/taille.
- Recherche avancee et filtres multicriteres (categorie, prix, disponibilite, localisation).
- Notifications (commande confirmee, statut modifie, alertes admin).
- Internationalisation complete de l'interface (si cible multi-langue).

## Suggestions et idees de fonctionnalites

- **Paiement en ligne**: integration Mobile Money / carte (workflow de paiement + webhook de confirmation).
- **Gestion de livraison**: zones, frais dynamiques, suivi de statut (`en preparation`, `expediee`, `livree`).
- **Coupons et promotions**: codes promo, remises temporaires, campagnes marketing.
- **Avis et notation**: notes sur boutiques/produits avec moderation simple.
- **Messagerie client-marchand**: discussion pre-achat/post-achat dans l'app.
- **Back-office produit avance**: variantes (taille/couleur), stock bas, import CSV.
- **Analytics metier**: revenus par periode, taux de conversion, top produits, retention clients.
- **PWA**: mode mobile installable + notifications push.
- **Observabilite**: Sentry + logs structures + dashboards de performance.
- **RGPD/securite**: politique de retention, consentement cookies, suppression compte.

## Recommandations generales d'evolution

- Standardiser les conventions de code (naming, organisation des dossiers, patterns de hooks/services).
- Introduire progressivement des Server Components/Server Actions la ou pertinent pour limiter la logique client.
- Centraliser les appels HTTP dans une couche data (services/repository) pour reduire la duplication.
- Ajouter de la telemetrie (logs structurees, monitoring erreurs, performances).
- Documenter les flux critiques (auth, commande, admin) et les decisions techniques.

## Notes de reorganisation appliquees

- Le dossier `app` a ete deplace de `src/app` vers `app/` a la racine, conforme a la structure Next.js moderne.
- La reference Tailwind/shadcn a ete ajustee pour pointer vers `app/globals.css`.
- Les dossiers `components`, `hooks`, `lib`, `store` et `types` ont ete deplaces a la racine et `src/` a ete supprime.
- La configuration Tailwind scanne desormais `app/**/*` ainsi que les dossiers metier a la racine.
