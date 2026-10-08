/**
 * Lenis smooth scrolling — desktop (hover + fine pointer) only, never with reduced motion.
 * Touch devices keep the platform's native scrolling, which is already smooth and never fights the finger.
 */
import Lenis from 'lenis';
import { finePointer, reducedMotion } from './lifecycle';

let lenis: Lenis | null = null;

if (!(window as any).__lenis && finePointer() && !reducedMotion()) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  (window as any).__lenis = lenis;
  const raf = (t: number) => { lenis?.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.addEventListener('astro:before-preparation', () => lenis?.stop());
  document.addEventListener('astro:page-load', () => {
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis.start();
  });
}

/** Scroll to a y position, smoothly when Lenis is active. */
export function scrollToY(y: number, immediate = false) {
  const l: Lenis | undefined = (window as any).__lenis;
  if (l) l.scrollTo(Math.max(0, y), { immediate, force: true });
  else window.scrollTo({ top: Math.max(0, y), behavior: immediate || reducedMotion() ? 'auto' : 'smooth' });
}
