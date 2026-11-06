/**
 * Preview tool for comparing full-page layouts for the section pages.
 * Only appears when the URL has ?layout (e.g. /?layout=a). The default look is unchanged without it.
 */
const OPTIONS = [
  { key: '', label: 'Current' },
  { key: 'a', label: 'A · Sheet' },
  { key: 'b', label: 'B · Ink' },
  { key: 'c', label: 'C · Split' },
] as const;

export function initLayoutSwitcher(): () => void {
  const params = new URLSearchParams(location.search);
  if (!params.has('layout')) return () => {};
  const stage = document.getElementById('stage');
  if (!stage) return () => {};

  const set = (key: string) => {
    if (key) stage.dataset.layout = key; else delete stage.dataset.layout;
    const q = new URLSearchParams(location.search);
    q.set('layout', key);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
  };

  const box = document.createElement('aside');
  box.className = 'layoutsw';
  box.setAttribute('aria-label', 'Page layout switcher');
  const buttons = OPTIONS.map((o) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.key = o.key; b.textContent = o.label;
    b.addEventListener('click', () => set(o.key));
    box.appendChild(b);
    return b;
  });
  document.body.appendChild(box);
  const start = params.get('layout') || '';
  set(OPTIONS.some((o) => o.key === start) ? start : '');
  return () => { box.remove(); delete stage.dataset.layout; };
}
