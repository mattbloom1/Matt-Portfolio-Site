// Vercel serverless function: emails a visitor's doodle to Matt via Resend (free tier).
// Needs the RESEND_API_KEY env var (set in Vercel). Nothing secret reaches the browser.
const TO = 'matthewb3333@gmail.com';
const ALLOWED = [/^https:\/\/(www\.)?matthewsbloomfield\.com$/, /^https:\/\/matt-portfolio-site[a-z0-9-]*\.vercel\.app$/];
const MAX_BYTES = 3 * 1024 * 1024;
const hits = new Map(); // best-effort per-instance limits
let globalHits = [];

function limited(ip) {
  const now = Date.now(), hour = 3600e3;
  globalHits = globalHits.filter((t) => now - t < hour);
  const mine = (hits.get(ip) || []).filter((t) => now - t < 10 * 60e3);
  if (globalHits.length >= 20 || mine.length >= 3) { hits.set(ip, mine); return true; }
  mine.push(now); globalHits.push(now); hits.set(ip, mine);
  if (hits.size > 500) hits.clear();
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const origin = req.headers.origin || '';
  if (!ALLOWED.some((r) => r.test(origin))) return res.status(403).json({ error: 'forbidden' });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || body.website) return res.status(400).json({ error: 'bad request' }); // honeypot
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(body.image || '');
  if (!m) return res.status(400).json({ error: 'bad image' });
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > MAX_BYTES || buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(400).json({ error: 'bad image' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'slow down' });
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Doodle <onboarding@resend.dev>', to: [TO], subject: 'New doodle from your site',
        text: 'Someone drew this on matthewsbloomfield.com.',
        attachments: [{ filename: 'doodle.jpg', content: m[1] }],
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'mail failed' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'mail failed' });
  }
};
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
