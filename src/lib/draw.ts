/** Charcoal-pencil drawing on the paper. Pointer events are read from the document so links, buttons and text keep working. */
export function initDrawing(canvas: HTMLCanvasElement, resetBtn: HTMLButtonElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const c = ctx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let drawn = false;

  function size() {
    const w = window.innerWidth, h = window.innerHeight;
    if (canvas.width === Math.round(w * dpr) && canvas.height === Math.round(h * dpr)) return;
    const old = document.createElement('canvas');
    old.width = canvas.width; old.height = canvas.height;
    old.getContext('2d')!.drawImage(canvas, 0, 0);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.drawImage(old, 0, 0, old.width / dpr, old.height / dpr);
  }
  size();

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  /** One charcoal "dab": a faint soft core plus scattered grain specks. */
  function dab(x: number, y: number, r: number, pressure: number) {
    c.fillStyle = `rgba(38,36,34,${0.035 * pressure})`;
    c.beginPath(); c.arc(x, y, r * 0.8, 0, Math.PI * 2); c.fill();
    const n = Math.round(14 + r * 4);
    for (let i = 0; i < n; i++) {
      const a = (0.08 + Math.random() * 0.45) * pressure;
      const s = 0.5 + Math.random() * 1.3;
      c.fillStyle = `rgba(${28 + Math.random() * 16 | 0},${26 + Math.random() * 14 | 0},${24 + Math.random() * 12 | 0},${a})`;
      c.fillRect(x + gauss() * r * 1.3, y + gauss() * r * 1.3, s, s * (0.6 + Math.random() * 0.8));
    }
  }

  let last: { x: number; y: number; t: number; w: number } | null = null;
  let id = -1;
  const stageOnly = (t: EventTarget | null) => {
    if (!(t instanceof HTMLElement)) return false;
    return t === canvas || t === document.body || t === document.documentElement
      || ['stage', 'stamps', 'content', 'bg'].includes(t.id) || t.classList.contains('panel') || t.classList.contains('bleed-layer');
  };
  function segment(x: number, y: number, t: number, p: number) {
    if (!last) return;
    const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
    const speed = d / Math.max(t - last.t, 1);
    const target = Math.max(3.2, 7 - speed * 2) * (0.7 + p * 0.6);
    const step = 1.2;
    const n = Math.max(1, Math.ceil(d / step));
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      last.w += (target - last.w) * 0.08;
      dab(last.x + dx * k, last.y + dy * k, last.w, 0.6 + p * 0.6);
    }
    last.x = x; last.y = y; last.t = t;
  }
  function showReset() {
    if (drawn) return;
    drawn = true;
    resetBtn.hidden = false;
    requestAnimationFrame(() => resetBtn.classList.add('on'));
  }

  const down = (e: PointerEvent) => {
    if (e.button !== 0 || id !== -1 || !stageOnly(e.target)) return;
    if (document.getElementById('stage')?.dataset.state === 'page' && e.pointerType === 'touch') return; // let touch scroll content
    e.preventDefault();
    id = e.pointerId;
    last = { x: e.clientX, y: e.clientY, t: e.timeStamp, w: 5 };
    const p = e.pressure || 0.5;
    dab(e.clientX, e.clientY, 5, 0.6 + p * 0.6);
    showReset();
  };
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const evs = e.getCoalescedEvents?.() ?? [e];
    for (const ev of evs) segment(ev.clientX, ev.clientY, ev.timeStamp, ev.pressure || 0.5);
  };
  const up = (e: PointerEvent) => { if (e.pointerId === id) { id = -1; last = null; } };
  const reset = () => {
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawn = false;
    resetBtn.classList.remove('on');
    window.setTimeout(() => { if (!drawn) resetBtn.hidden = true; }, 250);
  };

  document.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);
  window.addEventListener('resize', size);
  resetBtn.addEventListener('click', reset);
  return () => {
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    window.removeEventListener('resize', size);
    resetBtn.removeEventListener('click', reset);
  };
}
