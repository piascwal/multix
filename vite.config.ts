import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  // Chemins relatifs : le site est servi depuis un sous-chemin sur GitHub
  // Pages (https://<user>.github.io/multix/), pas depuis la racine du domaine.
  base: './',
  plugins: [preact()],
});
