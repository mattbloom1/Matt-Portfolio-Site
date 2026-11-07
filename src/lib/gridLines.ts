/**
 * Connects the white pedestals in the Websites cards into one continuous line grid.
 *
 * Every website card is the same 4:5 crop of the same mockup scene, so the edges of
 * the pedestal sit at fixed fractions of the card. This module reads where each card
 * really is, then draws the pedestal edges on through the gutters, so they run from
 * card to card (and wrap from row to row) however many columns the screen allows.
 * The lines sit behind the cards, so they only show in the gaps between them.
 */
const NS = 'http://www.w3.org/2000/svg';

/** Pedestal landmarks as fractions of a card (x, y), measured from the mockup scene. */
const LEFT_EXIT = [0, 0.66] as const; // top edge leaves the card on the left
const CORNER = [0.594, 0.8] as const; // the pedestal's front corner
const RIGHT_EXIT = [1, 0.5] as const; // the other top edge leaves on the right

type Pt = [number, number];

function build(host: HTMLElement) {
  host.querySelector(':scope > .grid-lines')?.remove();
  const cards = [...host.querySelectorAll<HTMLElement>(':scope > .card:not(.no-img)')];
  if (cards.length < 2) return;
  const at = (c: HTMLElement, f: readonly [number, number]): Pt => [c.offsetLeft + f[0] * c.offsetWidth, c.offsetTop + f[1] * c.offsetHeight];

  const chain: Pt[] = [];
  const stubs: Pt[][] = [];
  cards.forEach((c, i) => {
    chain.push(at(c, LEFT_EXIT), at(c, CORNER), at(c, RIGHT_EXIT));
    // the front corner's vertical edge drops through the gap to the card below it
    const below = cards.find((o, j) => j > i && Math.abs(o.offsetLeft - c.offsetLeft) < 2 && o.offsetTop > c.offsetTop);
    if (below) stubs.push([at(c, [CORNER[0], 1]), at(below, [CORNER[0], 0])]);
  });

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'grid-lines');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', String(host.offsetWidth));
  svg.setAttribute('height', String(host.offsetHeight));
  const line = (pts: Pt[], cls: string) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', pts.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' '));
    p.setAttribute('pathLength', '1');
    p.setAttribute('class', cls);
    svg.appendChild(p);
  };
  line(chain, 'gl-chain');
  stubs.forEach((s) => line(s, 'gl-stub'));
  host.prepend(svg);
}

/** Draw the grid for every Websites group inside `root`, and keep it fitted on resize. */
export function connectCards(root: HTMLElement): () => void {
  const hosts = [...root.querySelectorAll<HTMLElement>('section')]
    .filter((s) => s.querySelector('.group span')?.textContent?.trim() === 'Websites')
    .map((s) => s.querySelector<HTMLElement>('.cards'))
    .filter((h): h is HTMLElement => !!h);
  hosts.forEach((h) => h.classList.add('connected'));
  const draw = () => hosts.forEach(build);
  draw();
  const ro = new ResizeObserver(draw);
  hosts.forEach((h) => ro.observe(h));
  return () => ro.disconnect();
}
