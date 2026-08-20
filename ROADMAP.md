# Roadmap technique — Multi Fusion

## 1. État actuel

Le jeu est passé d'un `index.html` monolithique (~1600 lignes, CSS+JS
inline, sans build, sans types, sans tests) à une base **Vite + Preact +
TypeScript strict** :

- `src/game/` : logique pure et testée (questions, scoring, difficulté,
  badges, classement), 100% indépendante de l'UI.
- `src/components/` : écrans et composants Preact.
- 41 tests Vitest sur `src/game/`, ESLint + `tsc --noEmit` en strict,
  le tout exécuté en CI avant chaque déploiement.

Reste en `localStorage` (limite connue, cf. §2 dernière ligne) : le
classement, toujours isolé derrière `src/game/leaderboard.ts`.

## 2. Stack cible

| Avant | Maintenant | Pourquoi |
|---|---|---|
| HTML/CSS/JS inline, un seul fichier | ✅ **Vite + TypeScript strict** | build quasi instantané, zéro config, bon support PWA (`vite-plugin-pwa` à ajouter) |
| Pas de types | ✅ `tsconfig.json` en `strict: true` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | la logique de jeu (scores, multiplicateurs, pool de questions) est arithmétique et donc idéale pour être sécurisée par les types |
| Pas de framework UI | ✅ **Preact** (~3kb, hooks/JSX) | choisi en prévision du **mode duel** (§5) : un composant `PlayerPanel` instancié deux fois plutôt que deux chemins de code DOM dupliqués à la main. Solid.js aurait été plus performant mais moins familier ; vanilla aurait obligé à dupliquer la logique d'affichage pour le duel |
| Un seul fichier `<script>` | ✅ Modules séparés : `game/{questions,scoring,difficulty,badges,leaderboard,audio}.ts`, `components/*.tsx` | testabilité, lisibilité, revue de code plus simple |
| Aucun test | ✅ **Vitest** (41 tests) sur toute la logique pure. Playwright pour 2-3 parcours critiques bout-en-bout : pas encore fait | la logique de score/combo/diversité est justement le genre de code qui casse silencieusement sans tests |
| Pas de lint | ✅ **ESLint (typescript-eslint)**. Prettier + hook pre-commit : pas encore fait | cohérence, éviter les régressions triviales |
| CI: build only | ✅ CI GitHub Actions : `lint` + `test` + `build` (qui inclut `tsc --noEmit`) avant chaque déploiement Pages | voir `.github/workflows/deploy.yml` |
| `localStorage` classement | Toujours `localStorage`, isolé derrière `leaderboard.ts` | permet de brancher un vrai backend plus tard sans toucher au reste du code (cf. Phase 3 mobile) |

## 3. Plan app mobile

### Phase 1 — PWA ✅ faite

Favicon, icônes 192/512/maskable, manifest généré et service worker
(`vite-plugin-pwa`, mode `generateSW`) qui précache tous les assets :
- jouable hors-ligne (le jeu ne dépend d'aucune API réseau),
- installable ("Ajouter à l'écran d'accueil") sur iOS/Android/desktop,
- chargement instantané une fois le premier visit passé (assets servis
  depuis le cache).

Vérifié en local (`vite preview` + inspection du Cache Storage) : les
10 fichiers de l'app (JS, CSS, icônes, manifest) sont bien précachés.

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

## 5. Mode Duel (prévu, pas encore implémenté)

Écran scindé verticalement en deux, même question pour les deux joueurs,
premier qui répond marque le point, question suivante. Ce que la
migration actuelle prépare pour ça :

- `game/questions.ts`, `scoring.ts`, `badges.ts` sont déjà mode-agnostiques
  et réutilisables tels quels par un mode duel (même génération de
  questions, mêmes formules de points).
- `components/QcmAnswers.tsx` et `components/Keypad.tsx` sont déjà des
  composants indépendants, instanciables deux fois côte à côte.

Ce qu'il reste à faire (pas commencé) :

- Un composant `PlayerPanel` qui encapsule un jeu de réponse (QCM ou
  clavier) pour **un** joueur, avec une prop d'orientation pour l'afficher
  à l'envers (`transform: rotate(180deg)`) côté joueur qui fait face à
  l'autre.
- Un mode `duel` dans `game/` : au lieu d'un timer par joueur, une seule
  question partagée, un arbitrage "premier qui valide une réponse
  correcte gagne le point", et une transition question suivante commune
  aux deux panneaux.
- Gestion des deux entrées simultanées : en QCM pas de souci (deux zones
  de boutons distinctes) ; en clavier, le clavier physique devra être
  partitionné (ex. moitié gauche du clavier pour un joueur, pavé
  numérique ou moitié droite pour l'autre) ou rester tactile uniquement
  pour le duel.
- Écran de résultats duel (score des deux joueurs côte à côte) — les
  badges/classement actuels restent solo pour l'instant, un
  classement duel séparé pourra être ajouté plus tard si besoin.

## 6. Priorisation suggérée

1. ✅ Icône + PWA manifest (fait)
2. ✅ Déploiement GitHub Pages via Actions (fait)
3. ✅ Migration Vite + TS strict + Preact + découpage en modules (fait)
4. ✅ Tests Vitest sur la logique pure + CI qui les fait tourner (fait)
5. ✅ Service worker / PWA installable (fait)
6. Mode Duel (§5)
7. Capacitor + publication stores
8. (optionnel) backend classement en ligne
