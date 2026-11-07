/**
 * Swaps the mouse pointer for a random image (it only changes when you click, which stamps it) while it is over a project detail page that sets
 * data-icon-cursor (a JSON list of image URLs). Fine pointers only: nothing happens on touch.
 * Real controls (links, buttons) keep the normal pointer so they stay obviously clickable.
 */
const SIZE = 48;

export function initIconCursor(): () => void {
  if (typeof window === 'undefined' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('img');
  el.className = 'icon-cursor';
  el.alt = '';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  let bag: string[] = [];
  let list: string[] = [];
  let shown = false;
  const shuffle = (a: string[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = () => {
    if (!bag.length) bag = shuffle([...list]).filter((u) => u !== el.getAttribute('src'));
    el.src = bag.pop() as string;
    if (!reduce) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  };
  const hide = () => { if (shown) { shown = false; el.classList.remove('on'); } };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return hide();
    const t = e.target as HTMLElement | null;
    const d = t?.closest?.('.detail[data-icon-cursor]') as HTMLElement | null;
    if (!d || d.hidden || t!.closest('a, button, summary, input, select, textarea')) return hide();
    if (d.dataset.iconCursor && d.dataset.iconCursor !== el.dataset.set) {
      try { list = (JSON.parse(d.dataset.iconCursor) as string[]).filter((u) => typeof u === 'string'); } catch { list = []; }
      el.dataset.set = d.dataset.iconCursor; bag = []; list.slice(0, 6).forEach((u) => { new Image().src = u; });
    }
    if (!list.length) return hide();
    if (!shown) { shown = true; if (!el.getAttribute('src')) pick(); el.classList.add('on'); }
    // `translate` (not `transform`): the pop animation's scale/rotate are applied after it, so they pivot on the icon instead of scaling the offset
    el.style.translate = `${e.clientX - SIZE / 2}px ${e.clientY - SIZE / 2}px`;
  };
  /** A click stamps the current icon onto the page (it scrolls with the content), then the pointer becomes a new icon. */
  const onDown = (e: PointerEvent) => {
    if (!shown || e.pointerType !== 'mouse' || e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest('a, button, summary, input, select, textarea')) return hide(); // never stamp on a control
    const d = t.closest('.detail[data-icon-cursor]') as HTMLElement | null;
    if (!d) return;
    const st = document.createElement('img');
    st.className = 'icon-stamp';
    st.alt = '';
    st.setAttribute('aria-hidden', 'true');
    st.src = el.src;
    st.style.left = `${e.clientX - SIZE / 2}px`;
    st.style.top = `${e.clientY - SIZE / 2 + d.scrollTop}px`;
    st.style.rotate = `${(Math.random() * 16 - 8).toFixed(1)}deg`;
    d.appendChild(st);
    const stamps = d.querySelectorAll('.icon-stamp');
    if (stamps.length > 400) stamps[0].remove();
    pick();
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerdown', onDown);
  document.documentElement.addEventListener('pointerleave', hide);
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerdown', onDown);
    document.documentElement.removeEventListener('pointerleave', hide);
    el.remove();
  };
}
