# BoutikDigit

BoutikDigit est une application Next.js 16 orientee marketplace locale: elle permet d'afficher des boutiques, consulter des produits, gerer un panier, passer des commandes et administrer le contenu selon le role utilisateur.

## Etat actuel du projet

### Stack technique
- Framework: `Next.js 16` (App Router) + `React 19` + `TypeScript`
- UI: `Tailwind CSS v4`, composants `shadcn/ui` (Radix), `framer-motion`, `sonner`
- Donnees: `Prisma` + `MySQL`
- Authentification: `next-auth` (credentials)
- State management: `Zustand` (app/auth/cart/favorites)

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
- La navigation interne est pilotee par un store (`currentView`) plutot que par des routes URL dediees.
- Les donnees sont consommees via les endpoints `app/api/*`.
- Le modele de donnees Prisma couvre users, shops, products, orders et orderItems.

## Ameliorations prioritaires recommandees

1. **Passer d'une navigation "view store" a des routes App Router**
   - Creer des routes dediees (`/shop`, `/cart`, `/dashboard`, etc.) pour SEO, partage d'URL, analytics et maintenabilite.
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

## Recommandations generales d'evolution

- Standardiser les conventions de code (naming, organisation des dossiers, patterns de hooks/services).
- Introduire progressivement des Server Components/Server Actions la ou pertinent pour limiter la logique client.
- Centraliser les appels HTTP dans une couche data (services/repository) pour reduire la duplication.
- Ajouter de la telemetrie (logs structurees, monitoring erreurs, performances).
- Documenter les flux critiques (auth, commande, admin) et les decisions techniques.

## Scripts utiles

- `npm run dev` : lancer l'application en local
- `npm run build` : compiler l'application
- `npm run start` : executer la version build
- `npm run lint` : verifier le lint
- `npm run db:push` : synchroniser le schema Prisma
- `npm run db:generate` : generer le client Prisma
- `npm run db:migrate` : lancer une migration Prisma
- `npm run db:reset` : reinitialiser la base (attention: destructif)

## Notes de reorganisation appliquees

- Le dossier `app` a ete deplace de `src/app` vers `app/` a la racine, conforme a la structure Next.js moderne.
- La reference Tailwind/shadcn a ete ajustee pour pointer vers `app/globals.css`.
- Les dossiers `components`, `hooks`, `lib`, `store` et `types` ont ete deplaces a la racine et `src/` a ete supprime.
- La configuration Tailwind scanne desormais `app/**/*` ainsi que les dossiers metier a la racine.
