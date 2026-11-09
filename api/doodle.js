// Vercel serverless function: emails a visitor's doodle to Matt via Resend (free tier).
// Needs the RESEND_API_KEY env var (set in Vercel). Nothing secret reaches the browser.
const TO = 'matthewb3333@gmail.com';
const ALLOWED = [/^https:\/\/(www\.)?matthewsbloomfield\.com$/, /^https:\/\/matt-portfolio-site[a-z0-9-]*\.vercel\.app$/];
const MAX_BYTES = 3 * 1024 * 1024;
const { allow, clientIp } = require('./_ratelimit');

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
  const ip = clientIp(req);
  // 3 per IP per 10 minutes, 10 per IP per day, 30 in total per day (Resend free tier is 100/day shared with the contact form).
  if (!(await allow([{ key: `doodle:ip10m:${ip}`, limit: 3, windowSec: 600 }, { key: `doodle:ipday:${ip}`, limit: 10, windowSec: 86400 }, { key: 'doodle:day', limit: 30, windowSec: 86400 }]))) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ error: 'slow down' });
  }
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
