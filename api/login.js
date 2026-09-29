const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    const { user, pass } = req.body || {};
    const u = String(user || '').trim().toLowerCase();
    const acc = await L.getUser(u);
    const ok = acc && L.crypto.timingSafeEqual(Buffer.from(L.hash(pass, acc.salt)), Buffer.from(acc.hash));
    if (!ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    res.json({ token: await L.newSession(u) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
