# Roadmap technique — Multi Fusion

## 1. État actuel

Le jeu est passé d'un `index.html` monolithique (~1600 lignes, CSS+JS
inline, sans build, sans types, sans tests) à une base **Vite + Preact +
TypeScript strict** :

- `src/game/` : logique pure et testée (questions, scoring, difficulté,
  badges, classement, duel), 100% indépendante de l'UI.
- `src/components/` : écrans et composants Preact — mode solo (Classique
  / Time Attack), mode Duel (2 joueurs, premier à 10 points) et mode
  2048 (révision d'une table façon 2048).
- 63 tests Vitest sur `src/game/`, ESLint + `tsc --noEmit` en strict,
  le tout exécuté en CI avant chaque déploiement.
- PWA installable et jouable hors-ligne (service worker via
  `vite-plugin-pwa`).

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

## 5. Mode Duel ✅ fait

Téléphone posé à plat en vertical, un joueur à chaque extrémité, assis
face à face. Écran scindé en haut/bas (pas côte à côte — premier essai
côte à côte corrigé après retour utilisateur), même question dupliquée
au milieu (une copie normale, une copie retournée, collées l'une à
l'autre) pour que chaque joueur la lise dans le bon sens, premier qui
clique la bonne réponse marque le point, question suivante. Règles
retenues (validées avec l'utilisateur) :

- **QCM uniquement** — pas de mode clavier en duel, pour éviter d'avoir
  à partager le clavier physique entre deux joueurs (question ouverte
  du §5 initial, tranchée en faveur de la simplicité).
- **Premier à 10 points gagne** (`game/duel.ts` → `DUEL_TARGET_SCORE`).
- **Panneau du haut retourné à 180°** (`transform: rotate(180deg)` sur
  tout le panneau du joueur 2, et sur sa copie de la question) pour
  rester lisible à l'endroit depuis sa position, face au joueur 1 —
  c'est l'idée initiale du plan §5, qui avait été écartée à tort en
  implémentant d'abord un côte-à-côte.
- **Mode Solo/Duel choisi dès le lancement** (`ModeSelect.tsx`, nouvel
  écran racine) plutôt que le duel caché en second plan dans l'écran
  Solo — corrigé après retour utilisateur ("le duel est un peu perdu
  dans les menus").
- Pas de combo/diversité/badges/classement en duel — scoring volontairement
  simple (+1 point au premier qui trouve la bonne réponse), cohérent
  avec la demande initiale.

Implémentation :
- `game/duel.ts` (+ tests) : score cible et arbitrage du gagnant, pur et
  testé comme le reste de `game/`.
- `game/questions.ts` réutilisé tel quel (même génération de questions
  que le solo) — confirme que l'extraction en modules mode-agnostiques
  a payé.
- `components/DuelSetup.tsx`, `DuelGame.tsx`, `DuelResults.tsx` +
  `DuelQcmPanel.tsx` (variante de QCM qui accumule les essais faux d'un
  joueur sans bloquer les autres boutons, jusqu'à ce que l'un des deux
  trouve la bonne réponse).
- Arbitrage "premier qui répond" via une ref mutable (`DuelEngine`,
  même pattern que `Game.tsx`) plutôt que du state React/Preact, pour
  éviter un bug de fermeture obsolète (closure stale) si les deux
  joueurs cliquent à quelques millisecondes d'écart.

## 7. Mode 2048 ✅ fait

Variante 2048 pour réviser UNE table à la fois : les tuiles qui
apparaissent affichent l'expression (`4×3`), les tuiles issues d'une
fusion affichent le résultat (`12`) — c'est cette alternance qui force
le calcul mental. Deux points de conception discutés avec l'utilisateur
avant implémentation :

- **Tuiles jamais bloquées** : le moteur de fusion reste du 2048 pur
  (toujours valide dès que deux tuiles adjacentes sont égales). L'habillage
  "table de multiplication" ne s'applique qu'à l'affichage — tant que
  la valeur est un multiple de la table ≤ ×10 (`multiplierOf` dans
  `game/game2048.ts`), on montre l'expression ; au-delà, on retombe sur
  le nombre brut, comme le 2048 classique après son palier "2048".
  Ça évite tout risque de tuiles ×7/×9 qui ne peuvent plus jamais
  fusionner (le vrai problème derrière "ça dépasse ×10", pas juste un
  soucis d'affichage : le doublement pur ne visite naturellement que
  les puissances de 2 du multiplicateur).
- **"Table maîtrisée"** : la première fois qu'une fusion atteint **ou
  dépasse** table×10 (`newValue >= targetValue`, pas une égalité stricte)
  déclenche le bandeau de victoire — sinon une fusion qui saute
  directement par-dessus la cible (ex: 32+32→64 sans jamais passer par
  40 pile) ne la déclencherait jamais. Bug trouvé et corrigé pendant les
  tests manuels en jouant la partie jusqu'au bout.
- **Durée 5–10 minutes** : chrono fixe de 7 minutes affiché dans le HUD
  (`Mode2048Game.tsx`), la partie s'arrête aussi plus tôt si la grille
  se bloque. Les nouvelles tuiles piochent surtout de petits
  multiplicateurs (biais de poids dans `pickSpawnMultiplier`) pour
  limiter les fins de partie prématurées, tout en couvrant ×1 à ×10 sur
  la durée d'une partie.

Implémentation :
- `game/game2048.ts` (+ 17 tests) : moteur de grille 4×4 pur et testé
  (compression/fusion par ligne, rotation générique pour les 4
  directions, détection de fin de partie, tirage des tuiles), aucune
  dépendance à l'UI.
- `components/Mode2048Setup.tsx` (sélection d'UNE seule table, pas
  multi-table comme le solo/duel), `Mode2048Game.tsx` (grille CSS Grid,
  contrôles clavier flèches/WASD + swipe tactile), `Mode2048Results.tsx`.
- Vérifié manuellement en local : fusion/score/couleurs par palier,
  swipe tactile (testé via `Touch`/`TouchEvent` synthétiques), fin de
  partie par blocage de grille, victoire "table maîtrisée", rejouer.

## 8. Priorisation suggérée

1. ✅ Icône + PWA manifest (fait)
2. ✅ Déploiement GitHub Pages via Actions (fait)
3. ✅ Migration Vite + TS strict + Preact + découpage en modules (fait)
4. ✅ Tests Vitest sur la logique pure + CI qui les fait tourner (fait)
5. ✅ Service worker / PWA installable (fait)
6. ✅ Mode Duel (§5) (fait)
7. ✅ Mode 2048 (§7) (fait)
8. Capacitor + publication stores
9. (optionnel) backend classement en ligne
