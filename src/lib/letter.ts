/* Contact form that folds into a letter, goes into an envelope, gets a stamp and a postmark. Wired up each time the About page renders. */
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

  const box = form.parentElement as HTMLElement; // .letter
  const env = box.querySelector<HTMLElement>('.env');
  const q = <T extends Element = HTMLElement>(sel: string) => env?.querySelector<T>(sel) || null;

  /** Write the sender's name and today's postmark onto the envelope front. */
  function dress(name: string) {
    const now = new Date();
    const from = q('.env-from'); if (from) from.textContent = name;
    const day = q<SVGTextElement>('.env-day'); if (day) day.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    const year = q<SVGTextElement>('.env-year'); if (year) year.textContent = String(now.getFullYear());
  }

  /** Fold the sheet into thirds, slip it into the envelope, seal it, turn it over, stamp and postmark it. Leaves the envelope waiting in the `sending` state. */
  async function animate(): Promise<void> {
    const flap = q('.env-flap'), slot = q('.env-slot'), stamp = q('.env-stamp'), mark = q('.env-mark');
    if (!env || !flap || !slot || !stamp || !mark) return;
    const W = sheet!.offsetWidth, H = sheet!.offsetHeight, t = H / 3;
    const cloneIn = (i: number) => {
      const c = sheet!.cloneNode(true) as HTMLElement;
      c.setAttribute('inert', ''); c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      c.style.cssText = `position:absolute;left:0;top:${-i * t}px;width:${W}px;height:${H}px;margin:0;box-shadow:none;`;
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
      const c = cloneIn(i); const shade = document.createElement('div'); shade.className = 'fold-shade';
      p.append(c, shade); fold.appendChild(p);
      return { p, c, shade };
    });
    box.appendChild(fold);
    sheet!.style.visibility = 'hidden';
    const flip = (i: number, origin: string, deg: number, z: number, delay: number) => {
      const o = { duration: 520, delay, easing: EASE, fill: 'forwards' as const };
      const { p, c, shade } = panels[i];
      p.style.transformOrigin = origin; p.style.zIndex = String(z);
      // the written side turns away at the halfway point, leaving the blank back of the paper
      c.animate([{ opacity: 1 }, { opacity: 1, offset: .49 }, { opacity: 0, offset: .5 }, { opacity: 0 }], o);
      shade.animate([{ opacity: 0 }, { opacity: .2, offset: .5 }, { opacity: .03 }], o);
      return p.animate([{ transform: 'rotateX(0)' }, { transform: `rotateX(${deg}deg)` }], o).finished;
    };
    panels[1].shade.animate([{ opacity: 0 }, { opacity: .06 }], { duration: 500, fill: 'forwards' });
    // bottom third folds up, and the top third follows down over it before the first has quite landed
    await Promise.all([flip(2, 'top', 180, 2, 0), flip(0, 'bottom', -180, 3, 340)]);
    await wait(90);

    // The envelope comes up around the folded letter, back side showing with the flap open.
    env.dataset.side = 'back';
    flap.classList.add('inside'); flap.style.zIndex = '1'; flap.style.transform = 'rotateX(180deg)';
    stamp.style.opacity = '0'; mark.style.opacity = '0';
    box.classList.add('sending');
    const done = env.parentElement as HTMLElement;
    const EW = env.offsetWidth, EH = env.offsetHeight;
    const s = Math.min((EW - 28) / W, (EH * .62) / t);
    const restX = (EW - W * s) / 2, restY = (EH - t * s) / 2 + EH * .05;
    const envTop = Math.max(EH * .45, t - restY + 26) - env.offsetTop;
    done.style.top = `${envTop}px`;
    const rise = EH * .55;
    const letter = document.createElement('div');
    letter.className = 'env-letter';
    letter.style.cssText = `width:${W}px;height:${t}px;`;
    slot.appendChild(letter);
    fold.remove();
    const slide = { duration: 620, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' as const };
    env.querySelectorAll<HTMLElement>('.env-base, .env-flap, .env-pocket').forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'backwards' }));
    letter.animate([{ transform: `translate(0px, ${t - (envTop + env.offsetTop) - rise}px) scale(1)` }, { transform: `translate(${restX}px, ${restY}px) scale(${s})` }], slide);
    await env.animate([{ transform: `translateY(${rise}px)` }, { transform: 'none' }], { ...slide, fill: 'none' }).finished;

    // seal: the flap swings down toward you
    const close = flap.animate([{ transform: 'rotateX(180deg)' }, { transform: 'rotateX(0deg)' }], { duration: 400, easing: EASE, fill: 'forwards' });
    await wait(200);
    flap.style.zIndex = '4'; flap.classList.remove('inside');
    await close.finished;
    flap.style.transform = ''; close.cancel();
    await wait(120);

    // turn it over to the addressed side
    const P = 'perspective(1100px)';
    await env.animate([{ transform: `${P} rotateY(0deg)` }, { transform: `${P} rotateY(90deg)` }], { duration: 210, easing: 'cubic-bezier(.5,0,1,.6)' }).finished;
    env.dataset.side = 'front'; letter.remove(); flap.style.zIndex = '';
    await env.animate([{ transform: `${P} rotateY(-90deg)` }, { transform: `${P} rotateY(0deg)` }], { duration: 300, easing: 'cubic-bezier(.1,.6,.3,1)' }).finished;

    // stamp, then the postmark across it
    await wait(80);
    await stamp.animate([{ transform: 'translateY(-26px) scale(1.5) rotate(-9deg)', opacity: 0 }, { opacity: 1, offset: .5 }, { transform: 'scale(1) rotate(2deg)', opacity: 1 }], { duration: 230, easing: 'cubic-bezier(.5,0,1,.7)' }).finished;
    stamp.style.opacity = '';
    env.animate([{ transform: 'scale(.975)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' }); // thud
    await wait(170);
    await mark.animate([{ transform: 'rotate(-7deg) scale(1.18)', opacity: 0 }, { transform: 'rotate(-7deg) scale(1)', opacity: .72 }], { duration: 130, easing: 'ease-in' }).finished;
    mark.style.opacity = '';
    env.animate([{ transform: 'scale(.985)' }, { transform: 'none' }], { duration: 160, easing: 'ease-out' });
    await wait(380);
  }

  /** Hand over from the animation to the resting state: the envelope glides up to where it will stay while the space the form took closes. */
  function settle(from: DOMRect | null, fromH: number) {
    const done = env?.parentElement as HTMLElement | undefined;
    if (done) done.style.top = '';
    box.classList.remove('sending'); box.classList.add('sent');
    if (!env || !from || reduced()) return;
    const to = env.getBoundingClientRect();
    const o = { duration: 520, easing: 'cubic-bezier(.3,0,.2,1)' };
    env.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) rotate(0deg)` }, { transform: 'rotate(-2deg)' }], o);
    box.animate([{ height: `${fromH}px` }, { height: `${box.offsetHeight}px` }], o);
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
    const animated = !reduced();
    dress(String(fd.get('name') || '').trim());
    if (animated) await animate();
    const ok = await sending;
    if (ok) {
      cool = Date.now() + 60000;
      const rect = animated && env ? env.getBoundingClientRect() : null;
      const h = box.offsetHeight;
      form.reset();
      settle(rect, h);
      say('');
      root.querySelector<HTMLButtonElement>('.letter-again')?.focus({ preventScroll: true });
    } else {
      box.classList.remove('sending'); // the sheet comes back with what they wrote, and the status line says why
    }
    sheet.style.visibility = '';
    form.querySelectorAll<HTMLElement>('input,textarea,button').forEach((el) => ((el as HTMLInputElement).disabled = false));
    busy = false;
  };
  const onAgain = () => { box.classList.remove('sent'); say(''); form.querySelector<HTMLElement>('input')?.focus(); };
  form.addEventListener('submit', onSubmit);
  const again = root.querySelector('.letter-again');
  again?.addEventListener('click', onAgain);
  return () => { form.removeEventListener('submit', onSubmit); again?.removeEventListener('click', onAgain); };
}
