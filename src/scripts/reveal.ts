/**
 * [data-reveal] elements enter once when they scroll into view: opacity + 12px rise, 500ms enter easing,
 * staggered 35ms by the order they arrive in the same frame (max 10 steps). Values: '' (rise) | 'left' | 'fade'.
 */
import { onPage, reducedMotion } from './lifecycle';

(window as any).__rv = true; // tells PageShell's safety net that reveals are handled

onPage(() => {
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')];
  if (!els.length) return;
  if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    let i = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      el.style.setProperty('--i', String(Math.min(i++, 10)));
      el.classList.add('is-in');
      io.unobserve(el);
      el.addEventListener('transitionend', () => el.style.removeProperty('--i'), { once: true });
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  els.forEach((e) => io.observe(e));
  return () => io.disconnect();
});
