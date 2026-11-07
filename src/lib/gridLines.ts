/**
 * Connects the white pedestals in the Websites cards into one continuous shape.
 *
 * Each website card is rendered once per column count (4, 3 and 2). Scenes are mixed
 * and mirrored, and the box under each laptop is rebuilt (the laptop and its shadow
 * are kept) so the pedestal edges leave one card and enter the next at the same
 * height. The column count is measured from the real layout, and the matching set of
 * renders is picked from it.
 */
function flip(host: HTMLElement) {
  const cards = [...host.querySelectorAll<HTMLElement>(':scope > .card')];
  const cols = new Set(cards.map((c) => Math.round(c.offsetLeft / 4))).size;
  cards.forEach((c) => { c.dataset.cols = String(Math.min(4, Math.max(2, cols))); });
}

/** Alternate the mirrored scene across every Websites group inside `root`, refit on resize. */
export function connectCards(root: HTMLElement): () => void {
  const hosts = [...root.querySelectorAll<HTMLElement>('section')]
    .filter((s) => s.querySelector('.group span')?.textContent?.trim() === 'Websites')
    .map((s) => s.querySelector<HTMLElement>('.cards'))
    .filter((h): h is HTMLElement => !!h);
  hosts.forEach((h) => h.classList.add('connected'));
  const draw = () => hosts.forEach(flip);
  draw();
  const ro = new ResizeObserver(draw);
  hosts.forEach((h) => ro.observe(h));
  return () => ro.disconnect();
}
