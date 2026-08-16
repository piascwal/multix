# Roadmap technique — Multi Fusion

## 1. État actuel

`index.html` est un fichier unique (~1600 lignes) qui embarque CSS et JS
inline, sans build, sans types, sans tests. C'est un excellent point de
départ pour prototyper vite, mais ça devient risqué à faire évoluer :
pas de garde-fou à la compilation, une seule IIFE avec un `state` global,
aucune couverture de test sur la logique de score/badges/distracteurs, et
un classement stocké uniquement en `localStorage` (perdu si l'utilisateur
change d'appareil ou vide son cache).

L'objectif de ce document est de proposer une trajectoire **incrémentale**
(pas de grand soir / réécriture complète) vers une base plus robuste,
puis vers une app mobile.

## 2. Stack cible

| Aujourd'hui | Cible | Pourquoi |
|---|---|---|
| HTML/CSS/JS inline, un seul fichier | **Vite + TypeScript strict** | build quasi instantané, zéro config, bon support PWA (`vite-plugin-pwa`) |
| Pas de types | `tsconfig.json` avec `strict: true`, `noUncheckedIndexedAccess: true` | la logique de jeu (scores, multiplicateurs, pool de questions) est arithmétique et donc idéale pour être sécurisée par les types |
| Pas de framework UI | **Rester vanilla** (modules TS + petites fonctions de rendu), pas de framework tant que la complexité UI ne le justifie pas | le jeu est surtout piloté par état + DOM ciblé ; un framework (Preact/Solid) n'apporterait de valeur que si l'UI se complexifie beaucoup (ex. multi-écrans dynamiques, animations orchestrées) |
| Un seul fichier `<script>` | Modules séparés : `state.ts`, `audio.ts`, `questions.ts`, `scoring.ts`, `badges.ts`, `leaderboard.ts`, `screens/*.ts` | testabilité, lisibilité, revue de code plus simple |
| Aucun test | **Vitest** pour la logique pure (scoring, distracteurs, badges, diversité) + **Playwright** pour 2-3 parcours critiques (lancer une partie, répondre, enregistrer un score) | la logique de score/combo/diversité est justement le genre de code qui casse silencieusement sans tests |
| Pas de lint | **ESLint (typescript-eslint) + Prettier**, hook pre-commit léger (`simple-git-hooks` ou `lefthook`) | cohérence, éviter les régressions triviales |
| CI: build only | CI GitHub Actions : `typecheck` + `lint` + `test` sur chaque PR, déploiement Pages uniquement sur `main` | déjà amorcé avec `.github/workflows/deploy.yml`, à étendre avec un job `ci.yml` séparé |
| `localStorage` classement | Court terme : garder `localStorage`, mais isoler l'accès derrière un module `leaderboard.ts` avec une interface claire | permet de brancher un vrai backend plus tard sans toucher au reste du code |

### Migration proposée (sans tout casser d'un coup)

1. `npm create vite@latest` (template vanilla-ts), copier `index.html`
   tel quel dans le template, garder le rendu identique.
2. Extraire le CSS dans un fichier `.css` importé par Vite (aucun
   changement visuel).
3. Découper le script en modules TS, un domaine à la fois (commencer par
   `scoring.ts` + `badges.ts`, qui sont purs et faciles à tester).
4. Ajouter `strict: true` dès le départ sur les nouveaux fichiers plutôt
   que d'assouplir puis durcir plus tard.
5. Ajouter Vitest sur les modules extraits au fur et à mesure.
6. Étendre la CI existante avec les étapes `typecheck`/`lint`/`test`.

Chaque étape reste déployable : le site continue de fonctionner à
chaque commit, pas de branche de réécriture qui diverge pendant des
semaines.

## 3. Plan app mobile

### Phase 1 — PWA (déjà amorcée)

Le favicon, les icônes 192/512/maskable et le `site.webmanifest` ajoutés
dans ce commit posent les bases. Prochaine étape : un service worker
(`vite-plugin-pwa` une fois la migration Vite faite) pour :
- jouer hors-ligne (le jeu ne dépend d'aucune API réseau),
- proposer "Ajouter à l'écran d'accueil" sur iOS/Android,
- mettre en cache les assets pour un chargement instantané.

Coût : faible, gain immédiat (expérience quasi-native sans passer par
un store).

### Phase 2 — App stores via Capacitor

Plutôt qu'une réécriture React Native/Flutter (coûteuse et pas justifiée
tant que l'UI reste un jeu 2D piloté par DOM), envelopper le même
code web avec **Capacitor** :
- réutilise 100% du code existant,
- accès aux API natives utiles ici : haptique sur bonne/mauvaise
  réponse, partage de score, notifications locales ("reviens t'entraîner"),
  stockage natif fiable pour le classement (au lieu du seul `localStorage`),
- publication Play Store / App Store avec le même dépôt.

### Phase 3 (optionnelle) — Classement en ligne

Si le classement multi-appareils/multi-joueurs devient un objectif
(actuellement chaque classement est local à l'appareil), ajouter un
backend minimal (ex. Cloudflare Workers + D1, ou Supabase) derrière
l'interface `leaderboard.ts` déjà isolée à l'étape 2. Non prioritaire
pour le MVP mobile.

## 4. Priorisation suggérée

1. ✅ Icône + PWA manifest (fait)
2. ✅ Déploiement GitHub Pages via Actions (fait)
3. Migration Vite + TS strict + découpage en modules (logique pure
   d'abord : scoring, badges, distracteurs)
4. Tests Vitest sur ces modules + CI qui les fait tourner
5. Service worker / PWA installable
6. Capacitor + publication stores
7. (optionnel) backend classement en ligne
