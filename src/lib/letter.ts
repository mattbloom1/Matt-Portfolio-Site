/* Contact form that folds into a letter, gets a stamp, and sends. Wired up each time the About page renders. */
const STAMP = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/about-600.webp`;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const EASE = 'cubic-bezier(.65,0,.35,1)';

export function initLetter(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('.letter-form');
  const sheet = root.querySelector<HTMLElement>('.sheet');
  const status = root.querySelector<HTMLElement>('.letter-status');
  if (!form || !sheet || !status) return () => {};
  let busy = false, cool = 0;
  const say = (t: string) => { status.textContent = t; };

  async function post(fd: FormData): Promise<boolean> {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), message: fd.get('message'), website: fd.get('website') || '' }),
      });
      if (res.status === 429) { say('That is a lot of letters. Try again in a few minutes, or email me directly.'); return false; }
      if (!res.ok) throw new Error(String(res.status));
      return true;
    } catch { if (!status!.textContent) say("Couldn't send. Try again, or email me directly."); return false; }
  }

  /** Fold the filled-in sheet into thirds, stamp it, and send it off. Resolves when the animation is done. */
  async function animate(): Promise<void> {
    const box = form!.parentElement as HTMLElement; // .letter
    const W = sheet!.offsetWidth, H = sheet!.offsetHeight, t = H / 3;
    const cloneIn = (i: number) => {
      const c = sheet!.cloneNode(true) as HTMLElement;
      c.setAttribute('inert', ''); c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      c.style.cssText = `position:absolute;left:0;top:${-i * t}px;width:${W}px;height:${H}px;margin:0;`;
      // typed values live in properties, not attributes
      const live = [...sheet!.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')];
      c.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea').forEach((e, k) => { e.value = live[k].value; });
      return c;
    };
    const fold = document.createElement('div');
    fold.className = 'fold';
    fold.style.cssText = `width:${W}px;height:${H}px;`;
    const panels = [0, 1, 2].map((i) => {
      const p = document.createElement('div');
      p.className = 'fold-panel';
      p.style.cssText = `top:${i * t}px;height:${t}px;`;
      const c = cloneIn(i); p.appendChild(c); fold.appendChild(p);
      return { p, c };
    });
    box.appendChild(fold);
    sheet!.style.visibility = 'hidden';
    const o = { duration: 650, easing: EASE, fill: 'forwards' as const };
    const flip = (i: number, origin: string, deg: number) => {
      const { p, c } = panels[i];
      p.style.transformOrigin = origin; p.style.zIndex = '2';
      c.animate([{ opacity: 1 }, { opacity: 1, offset: .49 }, { opacity: 0, offset: .5 }, { opacity: 0 }], o);
      return p.animate([{ transform: 'rotateX(0)' }, { transform: `rotateX(${deg}deg)` }], o).finished;
    };
    await flip(2, 'top', 180);           // bottom third folds up
    await flip(0, 'bottom', -180);       // top third folds down over it
    // Swap the three panels for one flat folded letter (the middle third) so the stamp can sit on it without 3D stacking or clipping.
    const env = document.createElement('div');
    env.className = 'envelope';
    env.style.cssText = `left:0;top:${t}px;width:${W}px;height:${t}px;`;
    box.appendChild(env);
    fold.remove();
    await env.animate([{ transform: 'scale(1)' }, { transform: `scale(${Math.min(1, 320 / W)})` }], { duration: 450, easing: EASE, fill: 'forwards' }).finished;
    // stamp drops onto the top right corner of the folded letter
    const stamp = document.createElement('img');
    stamp.className = 'letter-stamp'; stamp.src = STAMP; stamp.alt = ''; stamp.setAttribute('aria-hidden', 'true');
    const mark = document.createElement('div'); mark.className = 'letter-mark'; mark.setAttribute('aria-hidden', 'true');
    env.appendChild(mark); env.appendChild(stamp);
    await stamp.animate([{ transform: 'translateY(-60px) scale(1.6) rotate(-12deg)', opacity: 0 }, { transform: 'translateY(0) scale(1) rotate(3deg)', opacity: 1 }], { duration: 340, easing: 'cubic-bezier(.5,0,1,.6)', fill: 'forwards' }).finished;
    env.animate([{ transform: `scale(${Math.min(1, 320 / W) * .97})` }, { transform: `scale(${Math.min(1, 320 / W)})` }], { duration: 160 }); // thud
    mark.animate([{ opacity: 0, transform: 'scale(1.5) rotate(-18deg)' }, { opacity: .5, transform: 'scale(1) rotate(-6deg)' }], { duration: 240, fill: 'forwards' });
    await wait(550);
    // off it goes
    const gone = box.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(40%, -60px) rotate(8deg) scale(.7)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.5,0,1,.5)', fill: 'forwards' });
    await gone.finished;
    gone.cancel();
    env.remove();
  }

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    if (Date.now() < cool) { say('Give it a minute before sending another.'); return; }
    if (!form.checkValidity()) {
      const bad = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(':invalid');
      const field = bad?.closest('label')?.firstChild?.textContent?.trim().toLowerCase() || 'a field';
      say(bad?.validity.valueMissing ? `Please fill in ${field}.` : bad?.validity.typeMismatch ? 'That email address does not look right.' : `Please check ${field}.`);
      bad?.focus();
      return;
    }
    const fd = new FormData(form); // read before the fields are disabled
    busy = true; say('');
    form.querySelectorAll<HTMLElement>('input,textarea,button').forEach((el) => ((el as HTMLInputElement).disabled = true));
    const sending = post(fd);
    if (!reduced()) await animate();
    const ok = await sending;
    const box = form.parentElement as HTMLElement;
    if (ok) {
      cool = Date.now() + 60000;
      form.reset();
      box.classList.add('sent');
      say('');
      const again = root.querySelector<HTMLButtonElement>('.letter-again');
      again?.focus();
    }
    sheet.style.visibility = '';
    form.querySelectorAll<HTMLElement>('input,textarea,button').forEach((el) => ((el as HTMLInputElement).disabled = false));
    busy = false;
  };
  const onAgain = () => { form.parentElement!.classList.remove('sent'); say(''); form.querySelector<HTMLElement>('input')?.focus(); };
  form.addEventListener('submit', onSubmit);
  const again = root.querySelector('.letter-again');
  again?.addEventListener('click', onAgain);
  return () => { form.removeEventListener('submit', onSubmit); again?.removeEventListener('click', onAgain); };
}
