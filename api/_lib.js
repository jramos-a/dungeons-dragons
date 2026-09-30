const crypto = require('crypto');
const URL_ = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_KEY;
const DAYS = 60;

async function sb(method, path, body, extra = {}) {
  if (!URL_ || !KEY) throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY en Vercel');
  const headers = { apikey: KEY, 'Content-Type': 'application/json', ...extra };
  if (KEY.startsWith('eyJ')) headers.Authorization = 'Bearer ' + KEY; // clave legacy (JWT)
  const r = await fetch(URL_ + '/rest/v1/' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error('Supabase: ' + t);
  return t ? JSON.parse(t) : null;
}
const q = encodeURIComponent;
const hash = (p, s) => crypto.scryptSync(String(p), s, 32).toString('hex');

async function getUser(u) {
  const rows = await sb('GET', `users?username=eq.${q(u)}&select=salt,hash,char`);
  return rows[0] || null;
}
const setUser = (u, o) =>
  sb('POST', 'users?on_conflict=username', { username: u, salt: o.salt, hash: o.hash, char: o.char },
    { Prefer: 'resolution=merge-duplicates' });

async function newSession(u) {
  const token = crypto.randomBytes(24).toString('hex');
  await sb('POST', 'sessions', { token, username: u });
  return token;
}
async function whoami(req) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (!t) return null;
  const since = new Date(Date.now() - DAYS * 864e5).toISOString();
  const rows = await sb('GET', `sessions?token=eq.${q(t)}&created_at=gt.${q(since)}&select=username`);
  return rows[0] ? rows[0].username : null;
}

module.exports = { crypto, hash, newSession, whoami, getUser, setUser };
