/* Contact form on a card that turns over like a postcard when sent, showing the address, stamp and postmark. Wired up each time the About page renders. */
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const card = box.querySelector<HTMLElement>('.card');
  const back = box.querySelector<HTMLElement>('.card-back');
  const mark = box.querySelector<SVGElement>('.pc-mark');
  const FLIP = { duration: 900, easing: 'cubic-bezier(.5,0,.15,1)' };

  /** Write the sender's name and today's postmark onto the back of the card. */
  function dress(name: string) {
    const now = new Date();
    const set = (sel: string, t: string) => { const el = box.querySelector(sel); if (el) el.textContent = t; };
    set('.pc-from', name ? `From ${name}` : '');
    set('.pc-day', now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase());
    set('.pc-year', String(now.getFullYear()));
  }

  /** Turn the card over in one motion, lifting slightly off the page on the way round. */
  function turn(from: number, to: number): Promise<unknown> {
    if (!card || reduced()) return Promise.resolve();
    card.animate({ scale: ['1', '1.035', '1'] }, { ...FLIP, easing: 'ease-in-out' });
    return card.animate({ rotate: [`y ${from}deg`, `y ${to}deg`] }, FLIP).finished;
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
    sheet.setAttribute('inert', ''); // no dimmed fields while the card turns
    dress(String(fd.get('name') || '').trim());
    // The card starts turning straight away; the postmark and the note only land once the letter has really gone.
    const sending = post(fd);
    box.classList.add('sent');
    await turn(0, 180);
    const ok = await sending;
    if (ok) {
      cool = Date.now() + 60000;
      form.reset();
      back?.removeAttribute('inert');
      box.classList.add('posted');
      if (!reduced()) {
        mark?.animate([{ scale: '1.22', opacity: 0 }, { scale: '1', opacity: .72 }], { duration: 150, easing: 'ease-in' });
        setTimeout(() => card?.animate({ scale: ['1', '.988', '1'] }, { duration: 220, easing: 'ease-out' }), 130); // the press
      }
      say('Your letter is on its way.');
      root.querySelector<HTMLButtonElement>('.letter-again')?.focus({ preventScroll: true });
    } else {
      // back to the written side, with what they wrote still there and the status line saying why
      box.classList.remove('sent');
      await turn(180, 0);
      sheet.removeAttribute('inert');
    }
    busy = false;
  };
  const onAgain = async () => {
    if (busy) return;
    busy = true;
    back?.setAttribute('inert', ''); sheet.removeAttribute('inert');
    box.classList.remove('sent');
    await turn(180, 360);
    box.classList.remove('posted'); say('');
    busy = false;
    form.querySelector<HTMLElement>('input')?.focus({ preventScroll: true });
  };
  form.addEventListener('submit', onSubmit);
  const again = root.querySelector('.letter-again');
  again?.addEventListener('click', onAgain);
  return () => { form.removeEventListener('submit', onSubmit); again?.removeEventListener('click', onAgain); };
}
