# ⚡ Multi Fusion — Les Tables en Feu

Jeu web (mono-page, HTML/CSS/JS vanilla) pour s'entraîner aux tables de
multiplication : mode QCM ou clavier, mode Classique ou Time Attack,
combos, badges et classements locaux.

## Démo

👉 https://piascwal.github.io/multix/

Déployé automatiquement sur GitHub Pages via GitHub Actions à chaque
push sur `main` (voir [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## Développement local

Aucune dépendance, aucun build : ouvre simplement [index.html](index.html)
dans un navigateur, ou sers le dossier avec n'importe quel serveur statique :

```bash
npx serve .
```

## Roadmap

Le plan d'évolution technique (stack TypeScript strict, tests, tooling,
puis app mobile) est détaillé dans [ROADMAP.md](ROADMAP.md).
