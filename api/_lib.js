const crypto = require('crypto');
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(...cmd) {
  if (!URL_ || !TOK) throw new Error('Falta conectar la base de datos Redis en Vercel');
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const hash = (p, s) => crypto.scryptSync(String(p), s, 32).toString('hex');
async function newSession(u) {
  const t = crypto.randomBytes(24).toString('hex');
  await redis('SET', 's:' + t, u, 'EX', 60 * 60 * 24 * 60);
  return t;
}
async function whoami(req) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t ? redis('GET', 's:' + t) : null;
}
const getUser = async u => { const v = await redis('GET', 'u:' + u); return v ? JSON.parse(v) : null; };
const setUser = (u, o) => redis('SET', 'u:' + u, JSON.stringify(o));

module.exports = { crypto, hash, newSession, whoami, getUser, setUser };
