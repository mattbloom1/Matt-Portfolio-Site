/** Charcoal-pencil drawing on the paper. Pointer events are read from the document so links, buttons and text keep working. */
export function initDrawing(canvas: HTMLCanvasElement, sendBtn: HTMLButtonElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const c = ctx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let drawn = false;
  let erasing = false;
  let cooldownUntil = 0;

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

  function erase(x: number, y: number) {
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = 'rgba(0,0,0,.9)';
    c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill();
    c.restore();
  }
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
    const step = erasing ? 6 : 1.2;
    const n = Math.max(1, Math.ceil(d / step));
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      if (erasing) { erase(last.x + dx * k, last.y + dy * k); continue; }
      last.w += (target - last.w) * 0.08;
      dab(last.x + dx * k, last.y + dy * k, last.w, 0.6 + p * 0.6);
    }
    last.x = x; last.y = y; last.t = t;
  }
  function showSend() {
    if (drawn) return;
    drawn = true;
    sendBtn.hidden = false;
    requestAnimationFrame(() => sendBtn.classList.add('on'));
  }
  function hideSend() {
    if (!drawn) return;
    drawn = false;
    sendBtn.classList.remove('on');
    window.setTimeout(() => { if (!drawn) sendBtn.hidden = true; }, 250);
  }
  const isBlank = () => {
    const d = c.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 8) return false;
    return true;
  };
  const flash = (t: string, ms = 2500) => { sendBtn.textContent = t; window.setTimeout(() => { sendBtn.textContent = 'send doodle'; sendBtn.disabled = Date.now() < cooldownUntil; }, ms); };
  /** Flatten onto paper, downscale, and POST to the serverless mailer. */
  async function send() {
    if (sendBtn.disabled) return;
    if (isBlank()) { flash('draw something first'); return; }
    sendBtn.disabled = true; sendBtn.textContent = 'sending\u2026';
    try {
      const out = document.createElement('canvas');
      const scale = Math.min(1, 1400 / canvas.width);
      out.width = Math.round(canvas.width * scale); out.height = Math.round(canvas.height * scale);
      const o = out.getContext('2d')!;
      o.fillStyle = '#ece9e2'; o.fillRect(0, 0, out.width, out.height);
      o.drawImage(canvas, 0, 0, out.width, out.height);
      const res = await fetch('/api/doodle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: out.toDataURL('image/jpeg', 0.85), website: '' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      cooldownUntil = Date.now() + 30000;
      flash('sent \u2713');
    } catch {
      flash("couldn't send");
    }
  }

  const down = (e: PointerEvent) => {
    if ((e.button !== 0 && e.button !== 2) || id !== -1 || !stageOnly(e.target)) return;
    erasing = e.button === 2;
    if (document.getElementById('stage')?.dataset.state === 'page' && e.pointerType === 'touch') return; // let touch scroll content
    e.preventDefault();
    id = e.pointerId;
    last = { x: e.clientX, y: e.clientY, t: e.timeStamp, w: 5 };
    const p = e.pressure || 0.5;
    if (erasing) erase(e.clientX, e.clientY);
    else { dab(e.clientX, e.clientY, 5, 0.6 + p * 0.6); showSend(); }
  };
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const evs = e.getCoalescedEvents?.() ?? [e];
    for (const ev of evs) segment(ev.clientX, ev.clientY, ev.timeStamp, ev.pressure || 0.5);
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = -1; last = null;
    if (erasing && drawn && isBlank()) hideSend();
  };
  const ctxMenu = (e: Event) => { if (stageOnly(e.target)) e.preventDefault(); };

  document.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);
  window.addEventListener('resize', size);
  document.addEventListener('contextmenu', ctxMenu);
  sendBtn.addEventListener('click', send);
  return () => {
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    window.removeEventListener('resize', size);
    document.removeEventListener('contextmenu', ctxMenu);
    sendBtn.removeEventListener('click', send);
  };
}
