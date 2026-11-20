/**
 * Channel-surfing screen wall for the GVC Brand Motion page.
 * One big screen plays a loop; a bank of small screens plays them all. Click a tile to cut to that channel;
 * until then the big screen flips to the next channel every few seconds.
 */
export function initMotionWall(): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopPlay = (e: Event) => { const t = e.target; if (t instanceof HTMLVideoElement && t.closest('[data-motion]')) t.pause(); };
  if (reduced) document.addEventListener('play', stopPlay, true); // honour reduced motion: posters only

  let manual = false;
  const wall = () => document.querySelector<HTMLElement>('.detail:not([hidden]) [data-motion]');
  const tune = (w: HTMLElement, tile: HTMLElement) => {
    const tv = w.querySelector<HTMLElement>('.tv'); const main = w.querySelector<HTMLVideoElement>('.tv-main');
    if (!tv || !main) return;
    w.querySelectorAll<HTMLElement>('.tv-tile').forEach((b) => b.setAttribute('aria-pressed', String(b === tile)));
    main.poster = tile.dataset.poster || '';
    main.src = tile.dataset.src || '';
    if (!reduced) main.play().catch(() => {});
    (tv.querySelector('.tv-ch') as HTMLElement).textContent = `CH ${String((+(tile.dataset.i || 0)) + 1).padStart(2, '0')}`;
    (tv.querySelector('.tv-name') as HTMLElement).textContent = tile.dataset.title || '';
    tv.classList.remove('cut'); void tv.offsetWidth; tv.classList.add('cut'); // quick static flash
  };
  const onClick = (e: MouseEvent) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('.tv-tile');
    const w = tile?.closest<HTMLElement>('[data-motion]');
    if (tile && w) { manual = true; tune(w, tile); }
  };
  document.addEventListener('click', onClick);
  const timer = window.setInterval(() => {
    if (manual || reduced || document.hidden) return;
    const w = wall(); if (!w) return;
    const r = w.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const tiles = Array.from(w.querySelectorAll<HTMLElement>('.tv-tile'));
    const cur = tiles.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
    tune(w, tiles[(cur + 1) % tiles.length]);
  }, 6000);
  return () => { document.removeEventListener('click', onClick); document.removeEventListener('play', stopPlay, true); clearInterval(timer); };
}
