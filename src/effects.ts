// Effets visuels éphémères (flash plein écran, étincelles, toasts, confettis).
// Manipulation DOM directe volontaire : ce sont des nœuds qui s'auto-suppriment
// après leur animation, hors du flux de rendu Preact (comme dans l'original).
import { pick, rand } from './game/random';

export function flashScreen(overlay: HTMLElement, color: 'green' | 'red'): void {
  overlay.className = '';
  void overlay.offsetWidth; // reflow pour relancer la transition
  overlay.classList.add(color === 'green' ? 'flash-green' : 'flash-red');
  setTimeout(() => overlay.classList.remove('flash-green', 'flash-red'), 160);
}

export function spawnSparks(): void {
  for (let i = 0; i < 4; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = rand(10, 90) + 'vw';
    spark.style.top = rand(30, 70) + 'vh';
    spark.style.background = pick(['#ff9d2e', '#ffd23f', '#ff2fd0']);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
}

export function showToast(container: HTMLElement, text: string): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 1100);
}

export function launchConfetti(container: HTMLElement): void {
  const colors = ['#b967ff', '#00f0ff', '#39ff14', '#ff2fd0', '#ff9d2e', '#ffd23f'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = rand(0, 100) + 'vw';
    piece.style.background = pick(colors);
    piece.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
    const duration = rand(22, 42) / 10;
    piece.style.animationDuration = duration + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 1) * 1000);
  }
}
