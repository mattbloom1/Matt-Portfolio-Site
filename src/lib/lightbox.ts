/**
 * Plain lightbox for film photos and posters: click an image to view it full screen.
 * Arrow keys, side buttons and swipe move through that roll or set; Esc, the close button or a tap outside closes.
 */
export function initLightbox(): () => void {
  const root = document.createElement('div');
  root.className = 'lb';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Image viewer');
  root.innerHTML = `
    <div class="lb-top"><span class="lb-cap" aria-live="polite"></span><button type="button" class="lb-close" aria-label="Close viewer">close ×</button></div>
    <button type="button" class="lb-nav lb-prev" aria-label="Previous image">‹</button>
    <figure class="lb-fig"></figure>
    <button type="button" class="lb-nav lb-next" aria-label="Next image">›</button>`;
  document.body.appendChild(root);

  const fig = root.querySelector('.lb-fig') as HTMLElement;
  // The <img> only exists while the viewer is open, so the page never carries an empty-src image.
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  const cap = root.querySelector('.lb-cap') as HTMLElement;
  const closeBtn = root.querySelector('.lb-close') as HTMLButtonElement;

  let frames: HTMLImageElement[] = [];
  let i = 0;
  let opener: HTMLImageElement | null = null;
  let title = '';

  const show = (n: number) => {
    i = (n + frames.length) % frames.length;
    const el = frames[i];
    img.src = el.src; // always the full-size file, even when the tile loaded a smaller variant
    img.alt = el.alt;
    cap.textContent = `${title ? title.toLowerCase() + ' · ' : ''}${i + 1} / ${frames.length}`;
    for (const d of [-1, 1]) { const p = new Image(); p.src = frames[(i + d + frames.length) % frames.length].src; } // preload neighbours
  };
  const open = (el: HTMLImageElement) => {
    const gal = el.closest('.roll-gallery, .poster-gallery');
    if (!gal) return;
    frames = Array.from(gal.querySelectorAll<HTMLImageElement>('img'));
    title = (gal.closest('.roll')?.querySelector('.series')?.firstChild?.textContent || '').trim();
    opener = el;
    root.hidden = false;
    fig.replaceChildren(img);
    document.documentElement.classList.add('lb-open');
    show(frames.indexOf(el));
    closeBtn.focus();
  };
  const close = () => {
    root.hidden = true;
    document.documentElement.classList.remove('lb-open');
    fig.replaceChildren();
    img.removeAttribute('src');
    opener?.scrollIntoView({ block: 'center' });
    opener?.focus?.({ preventScroll: true });
  };

  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (root.hidden && t instanceof HTMLImageElement && t.closest('#content .roll-gallery, #content .poster-gallery')) open(t);
  };
  const onKey = (e: KeyboardEvent) => {
    if (root.hidden) {
      // Enter or Space on a focused gallery image opens it, like a button.
      const t = document.activeElement;
      if ((e.key === 'Enter' || e.key === ' ') && t instanceof HTMLImageElement && t.closest('#content .roll-gallery, #content .poster-gallery')) { e.preventDefault(); open(t); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  };
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey, true); // capture: beat the page-level Escape handler

  (root.querySelector('.lb-prev') as HTMLElement).addEventListener('click', () => show(i - 1));
  (root.querySelector('.lb-next') as HTMLElement).addEventListener('click', () => show(i + 1));
  closeBtn.addEventListener('click', close);
  root.addEventListener('click', (e) => { if (e.target === root || (e.target as HTMLElement).classList.contains('lb-fig')) close(); });

  let sx = 0, sy = 0;
  root.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(i + (dx < 0 ? 1 : -1));
  }, { passive: true });

  return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey, true); root.remove(); document.documentElement.classList.remove('lb-open'); };
}
