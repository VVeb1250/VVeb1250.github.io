/**
 * One scroll/resize loop for the whole site. Subscribers get (scrollY, viewportHeight) at most once per frame.
 * Keep work inside subscribers cheap: read layout first, then write styles (no read-after-write).
 */
type Sub = (y: number, vh: number) => void;
const subs = new Set<Sub>();
let ticking = false;
let bound = false;

function frame() {
  ticking = false;
  const y = window.scrollY, vh = window.innerHeight;
  for (const s of subs) s(y, vh);
}
export function requestFrame() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}
export function onScroll(fn: Sub): () => void {
  subs.add(fn);
  if (!bound) {
    bound = true;
    addEventListener('scroll', requestFrame, { passive: true });
    addEventListener('resize', requestFrame, { passive: true });
  }
  requestFrame();
  return () => { subs.delete(fn); };
}

/**
 * While the page is scrolling, content under a RESTING mouse cursor does not react: `html.scrolling` (base.css → pointer-events
 * none on main, hover devices only). The header stays clickable. Otherwise, as content slides under a still cursor, hover styles switch on and
 * off and hover reveals (SketchReveal, LabItem, the strip's cards) start mid-scroll — style recalcs, repaints and whole
 * reveal animations inside scroll frames. Moving the mouse gives the page back at once (the person is aiming at
 * something) and it stays given back until this scroll ends. Cleared 150ms after the last scroll event (Lenis keeps
 * firing them until its glide ends).
 */
if (matchMedia('(hover: hover)').matches) {
  const html = document.documentElement;
  let idle = 0, aiming = false;
  addEventListener('scroll', () => {
    if (!aiming && !html.classList.contains('scrolling')) html.classList.add('scrolling');
    clearTimeout(idle);
    idle = window.setTimeout(() => { html.classList.remove('scrolling'); aiming = false; }, 150);
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !html.classList.contains('scrolling')) return;
    aiming = true;
    html.classList.remove('scrolling');
  }, { passive: true });
}
