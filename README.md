# ⚡ Multi Fusion — Les Tables en Feu

Jeu web (Preact + TypeScript strict, build Vite) pour s'entraîner aux
tables de multiplication : mode QCM ou clavier, mode Classique ou Time
Attack, combos, badges et classements locaux.

## Démo

👉 https://piascwal.github.io/multix/

Déployé automatiquement sur GitHub Pages via GitHub Actions à chaque
push sur `main` (voir [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## Développement local

```bash
npm install
npm run dev       # serveur de dev avec rechargement à chaud
npm run typecheck # tsc --noEmit (strict)
npm run lint      # eslint
npm test          # vitest (logique de jeu pure : scoring, questions, badges, classement)
npm run build     # build de prod dans dist/
```

## Structure

- [src/game/](src/game) — logique pure et testée (questions, scoring,
  difficulté, badges, classement), indépendante de l'UI.
- [src/components/](src/components) — écrans et composants Preact.
- [src/effects.ts](src/effects.ts) — effets visuels éphémères (flash,
  étincelles, confettis, toasts), en manipulation DOM directe assumée.
- [public/](public) — favicon, icônes PWA, manifest, copiés tels quels.

## Roadmap

Le plan d'évolution technique (stack TypeScript strict, tests, tooling,
puis app mobile — y compris un futur mode duel) est détaillé dans
[ROADMAP.md](ROADMAP.md).
