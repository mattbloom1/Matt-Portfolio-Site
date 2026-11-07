/**
 * Film lightbox: click any photo or poster to see it full screen, like a frame on a light table.
 * Arrow keys, swipe, or the side buttons move through that roll; Esc closes. A sprocket-edged strip
 * shows the frames around the current one. Works on any `.roll-gallery` / `.poster-gallery` image.
 */
export function initLightbox(): () => void {
  const root = document.createElement('div');
  root.className = 'lb';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Photo viewer');
  root.innerHTML = `
    <div class="lb-top"><span class="lb-cap"></span><button type="button" class="lb-close" aria-label="Close viewer">close ×</button></div>
    <button type="button" class="lb-nav lb-prev" aria-label="Previous photo">‹</button>
    <figure class="lb-fig"><img alt="" decoding="async"></figure>
    <button type="button" class="lb-nav lb-next" aria-label="Next photo">›</button>
    <div class="lb-strip" aria-hidden="true"></div>`;
  document.body.appendChild(root);

  const img = root.querySelector('img') as HTMLImageElement;
  const cap = root.querySelector('.lb-cap') as HTMLElement;
  const strip = root.querySelector('.lb-strip') as HTMLElement;
  const closeBtn = root.querySelector('.lb-close') as HTMLButtonElement;

  let frames: HTMLImageElement[] = [];
  let i = 0;
  let opener: HTMLElement | null = null;
  let title = '';

  const label = (el: HTMLImageElement) => el.alt || title;

  const show = (n: number) => {
    i = (n + frames.length) % frames.length;
    const el = frames[i];
    img.classList.remove('in');
    img.src = el.currentSrc || el.src;
    img.alt = label(el);
    requestAnimationFrame(() => img.classList.add('in'));
    cap.textContent = `${title ? title.toLowerCase() + ' · ' : ''}frame ${i + 1} of ${frames.length}`;
    // neighbours are preloaded so arrows feel instant
    for (const d of [-1, 1]) { const nx = frames[(i + d + frames.length) % frames.length]; const p = new Image(); p.src = nx.currentSrc || nx.src; }
    // filmstrip: five frames centred on the current one
    strip.innerHTML = '';
    for (let k = -2; k <= 2; k++) {
      if (frames.length < 2 && k !== 0) continue;
      const f = frames[(i + k + frames.length * 3) % frames.length];
      const t = document.createElement('span');
      t.className = 'lb-thumb' + (k === 0 ? ' on' : '');
      t.style.backgroundImage = `url("${f.currentSrc || f.src}")`;
      strip.appendChild(t);
    }
  };

  const open = (el: HTMLImageElement) => {
    const gal = el.closest('.roll-gallery, .poster-gallery');
    if (!gal) return;
    frames = Array.from(gal.querySelectorAll<HTMLImageElement>('img'));
    title = (gal.closest('.roll')?.querySelector('.series')?.firstChild?.textContent || '').trim();
    opener = el.closest('figure') as HTMLElement | null;
    root.hidden = false;
    document.documentElement.classList.add('lb-open');
    show(frames.indexOf(el));
    closeBtn.focus();
  };
  const close = () => {
    root.hidden = true;
    document.documentElement.classList.remove('lb-open');
    img.removeAttribute('src');
    opener?.querySelector('img')?.scrollIntoView({ block: 'center' });
  };

  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (!root.hidden) return;
    if (t instanceof HTMLImageElement && t.closest('#content .roll-gallery, #content .poster-gallery')) open(t);
  };
  const onKey = (e: KeyboardEvent) => {
    if (root.hidden) return;
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

  // swipe
  let sx = 0, sy = 0;
  root.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(i + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
  }, { passive: true });

  return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey, true); root.remove(); document.documentElement.classList.remove('lb-open'); };
}
