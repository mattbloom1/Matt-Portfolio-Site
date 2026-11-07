/**
 * Connects the white pedestals in the Websites cards into one continuous shape.
 *
 * Every website card is the same MacBook scene. Each one also has a mirrored render
 * of that scene (screen content kept readable). Across a row the cards alternate
 * normal, mirrored, normal, mirrored, and the pedestal edges leave one card and
 * enter the next at exactly the same height, so the boxes read as one zigzag of
 * blocks. The column is measured from the real layout, so it holds whether the
 * screen gives four, three or two columns.
 */
function flip(host: HTMLElement) {
  const cards = [...host.querySelectorAll<HTMLElement>(':scope > .card')];
  const lefts = [...new Set(cards.map((c) => Math.round(c.offsetLeft)))].sort((a, b) => a - b);
  cards.forEach((c) => {
    const col = lefts.findIndex((x) => Math.abs(x - c.offsetLeft) < 3);
    if (col % 2 === 1) c.dataset.flip = '1'; else delete c.dataset.flip;
  });
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
