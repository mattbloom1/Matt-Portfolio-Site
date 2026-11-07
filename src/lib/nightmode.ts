/**
 * Night mode: the paper goes to ink after dark, by the visitor's own clock (the footer clock already shows it).
 * A small moon/sun button next to the clock overrides it. Choice is saved per browser.
 */
const KEY = 'theme.v1'; // 'day' | 'night'; absent = follow the clock
type Theme = 'day' | 'night';

const autoTheme = (): Theme => { const h = new Date().getHours(); return h >= 19 || h < 6 ? 'night' : 'day'; };
const saved = (): Theme | null => { try { const v = localStorage.getItem(KEY); return v === 'day' || v === 'night' ? v : null; } catch { return null; } };

const MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';

export function initNightMode(): () => void {
  const root = document.documentElement;
  const right = document.querySelector('.foot-right');
  const clock = document.getElementById('clock');
  if (!right) return () => {};

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';

  const apply = (t: Theme) => {
    root.dataset.theme = t;
    btn.innerHTML = t === 'night' ? SUN : MOON;
    btn.setAttribute('aria-label', t === 'night' ? 'Switch to day mode' : 'Switch to night mode');
    btn.title = btn.getAttribute('aria-label') as string;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', t === 'night' ? '#15171c' : '#ece9e2');
  };
  apply(saved() || autoTheme());
  btn.addEventListener('click', () => {
    const next: Theme = root.dataset.theme === 'night' ? 'day' : 'night';
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
    apply(next);
  });
  right.insertBefore(btn, clock);

  // Follow the clock across dusk and dawn while the page is open, unless the visitor chose.
  const timer = window.setInterval(() => { if (!saved()) apply(autoTheme()); }, 60000);
  return () => { clearInterval(timer); btn.remove(); };
}
