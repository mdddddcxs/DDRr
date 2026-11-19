# La DDR — La Dawah dans la rue

Site de l’association ivoirienne La DDR : débats et directs YouTube, prêche du jeudi, lecture du Coran,
espace enfants (quiz et jeux), Compagnon IA, témoignages, demandes de conversion, rendez-vous et dons.

**Technique :** React 19 + Vite + Tailwind CSS 4 · base de données et connexion admin **Supabase** ·
fonctions serveur **Vercel** (`/api`) pour YouTube et Gemini.

## Sécurité : principes

- **Aucune clé secrète dans le navigateur.** YouTube et Gemini passent par `/api/*` (côté serveur).
  La voix du Compagnon utilise un jeton temporaire (1 utilisation, 30 min).
- **Admin = Supabase Auth + table `admins`.** Plus de mot de passe dans le code. Même si quelqu’un crée un
  compte, il n’a accès à rien tant qu’il n’est pas dans `admins`.
- **Règles RLS** (`supabase/migrations`) : un visiteur peut seulement *envoyer* un formulaire,
  jamais lire les demandes des autres. Anti-spam : limite d’envois par numéro et par jour, champ piège invisible.
- **Audio des témoignages** dans un espace de stockage privé, écoutable seulement par les admins, supprimé après 7 jours.
- **En-têtes de sécurité** (CSP, HSTS, anti-iframe…) dans `vercel.json`.
- Suppression du « journal espion » des visiteurs, des faux dons, faux témoignages et fausses actualités.

## Mise en route

### 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (région Europe conseillée).
2. SQL Editor → exécuter, dans l’ordre, les deux fichiers de `supabase/migrations/` (`…000000_init.sql` puis `…010000_media_admins.sql`).
3. Authentication → Sign In / Providers → **désactiver « Allow new users to sign up »**.
4. Authentication → Users → **Add user** (email + mot de passe solide) pour chaque responsable.
5. SQL Editor : `insert into public.admins (user_id, display_name) select id, 'Nom' from auth.users where email = 'email@exemple.com';`

### 2. Variables d’environnement (Vercel → Settings → Environment Variables)

Voir `.env.example`. Les clés `GEMINI_API_KEY`, `YOUTUBE_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` restent **secrètes** (jamais de préfixe `VITE_`).
Dans Google Cloud, restreindre la clé YouTube à « YouTube Data API v3 ».

### 3. Déploiement Vercel

Importer le dépôt GitHub dans Vercel : le framework Vite est détecté, `vercel.json` gère le reste.

### Développement local

```bash
npm install
cp .env.example .env.local   # puis remplir
npx vercel dev               # site + fonctions /api
```

## Ce que l’administrateur contrôle

| Page admin | Ce qu’on peut faire |
|---|---|
| Tableau de bord | Vue d’ensemble : demandes en attente, dons du mois, campagne |
| Témoignages | Lire / écouter, rappeler, supprimer (effacement automatique après 7 jours) |
| Rendez-vous | Confirmer, refuser, supprimer, appeler |
| Conversions | Suivre chaque personne : à appeler → contacté → shahâda faite |
| Dons | Enregistrer un don reçu, supprimer, exporter vers Excel |
| Campagne | Titre, texte, objectif, photo (le montant collecté se calcule seul) |
| Actualités | Écrire, modifier, supprimer des articles avec photo |
| Contenu du site | Téléphones, WhatsApp, email, adresse, réseaux sociaux, jour/heure/lieu du prêche, intervenants (photo, présentation, liens) |
| Réglages | Mode maintenance, liste newsletter, ajouter/retirer des administrateurs, changer son mot de passe |

## À faire plus tard

- **Paiement en ligne** (Wave / Orange Money / MTN) : à brancher quand la DDR aura son propre compte marchand.
  En attendant, la page Dons renvoie vers WhatsApp/téléphone et l’admin enregistre les dons reçus.
- **Photos officielles** : à envoyer depuis Admin → Contenu du site (photos fournies par la DDR).
- La DDR possède déjà un ancien site (groupeddr.org) : à rediriger vers le nouveau si elle le souhaite.
