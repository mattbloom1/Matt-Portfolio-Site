// Shared rate limiter for the serverless mailers (free tier).
// With UPSTASH_REDIS_REST_URL/TOKEN (or Vercel's KV_REST_API_URL/TOKEN) set, counts live in Upstash Redis
// and are shared across every serverless instance. Without them it falls back to per-instance memory,
// which is only best-effort. Fixed windows: INCR, and EXPIRE on the first hit.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const mem = new Map();

async function hit(key, windowSec) {
  if (URL_ && TOKEN) {
    const r = await fetch(`${URL_}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(windowSec), 'NX']]),
    });
    if (!r.ok) throw new Error('ratelimit store ' + r.status);
    const out = await r.json();
    return Number(out[0] && out[0].result);
  }
  const now = Date.now();
  const e = mem.get(key);
  if (!e || e.reset < now) { mem.set(key, { n: 1, reset: now + windowSec * 1000 }); if (mem.size > 2000) mem.clear(); return 1; }
  return ++e.n;
}

/** rules: [{ key, limit, windowSec }]. Resolves true when the request may go ahead. Fails open if the store is down. */
async function allow(rules) {
  for (const r of rules) {
    try { if ((await hit(`rl:${r.key}`, r.windowSec)) > r.limit) return false; } catch { /* store down: don't block mail */ }
  }
  return true;
}

function clientIp(req) {
  return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}
module.exports = { allow, clientIp };
