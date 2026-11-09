// Vercel serverless function: emails the letter-form message to Matt via Resend (free tier).
// Needs RESEND_API_KEY (set in Vercel). Rate limited via api/_ratelimit.js.
const { allow, clientIp } = require('./_ratelimit');
const TO = 'matthewb3333@gmail.com';
const ALLOWED = [/^https:\/\/(www\.)?matthewsbloomfield\.com$/, /^https:\/\/matt-portfolio-site[a-z0-9-]*\.vercel\.app$/];

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!ALLOWED.some((r) => r.test(req.headers.origin || ''))) return res.status(403).json({ error: 'forbidden' });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || typeof body !== 'object' || body.website) return res.status(400).json({ error: 'bad request' }); // honeypot
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const message = String(body.message || '').replace(/\r\n/g, '\n').trim().slice(0, 5000);
  if (!name || message.length < 2 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return res.status(400).json({ error: 'bad request' });
  const ip = clientIp(req);
  // 3 per IP per 10 minutes, 8 per IP per day, 30 in total per day.
  if (!(await allow([{ key: `contact:ip10m:${ip}`, limit: 3, windowSec: 600 }, { key: `contact:ipday:${ip}`, limit: 8, windowSec: 86400 }, { key: 'contact:day', limit: 30, windowSec: 86400 }]))) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ error: 'slow down' });
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Letter <onboarding@resend.dev>', to: [TO], reply_to: email,
        subject: `New letter from ${name}`.replace(/[\r\n]/g, ' '),
        text: `From: ${name} <${email}>\n\n${message}\n\nSent from matthewsbloomfield.com`,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'mail failed' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'mail failed' });
  }
};
function clean(v, n) { return String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
