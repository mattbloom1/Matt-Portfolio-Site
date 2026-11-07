/**
 * Collectible cards: project and poster cards lean toward the pointer in 3D and catch a soft glint of light,
 * like a stamp turned under a lamp. Mouse and pen only; skipped for touch and reduced motion.
 */
export function initCardTilt(): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || calm.matches) return () => {};
  const MAX = 7; // degrees
  let el: HTMLElement | null = null;
  let raf = 0;

  const reset = (c: HTMLElement) => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); c.classList.remove('tilting'); };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const c = (e.target as HTMLElement).closest?.('#content .card') as HTMLElement | null;
    if (el && el !== c) { reset(el); el = null; }
    if (!c) return;
    el = c;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.classList.add('tilting');
      c.style.setProperty('--rx', `${((0.5 - py) * MAX * 2).toFixed(2)}deg`);
      c.style.setProperty('--ry', `${((px - 0.5) * MAX * 2).toFixed(2)}deg`);
      c.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      c.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
  };
  const onLeave = () => { if (el) { reset(el); el = null; } };
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); cancelAnimationFrame(raf); if (el) reset(el); };
}
