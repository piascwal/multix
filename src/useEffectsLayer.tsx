import { useRef } from 'preact/hooks';
import { flashScreen, launchConfetti, showToast, spawnSparks } from './effects';

export function useEffectsLayer() {
  const flashOverlayRef = useRef<HTMLDivElement>(null);
  const toastContainerRef = useRef<HTMLDivElement>(null);
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  const layer = (
    <>
      <div id="flash-overlay" ref={flashOverlayRef} />
      <div id="confetti-container" ref={confettiContainerRef} />
      <div id="toast-container" ref={toastContainerRef} />
    </>
  );

  return {
    layer,
    flashScreen: (color: 'green' | 'red') => {
      if (flashOverlayRef.current) flashScreen(flashOverlayRef.current, color);
    },
    spawnSparks,
    showToast: (text: string) => {
      if (toastContainerRef.current) showToast(toastContainerRef.current, text);
    },
    launchConfetti: () => {
      if (confettiContainerRef.current) launchConfetti(confettiContainerRef.current);
    },
  };
}
