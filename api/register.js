const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    const { user, char } = req.body || {};
    const u = String(user || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(u))
      return res.status(400).json({ error: 'Usuario: 3-20 letras, números o _' });
    if (!char || typeof char !== 'object') return res.status(400).json({ error: 'Falta el personaje' });
    if (await L.getUser(u)) return res.status(409).json({ error: 'Ese usuario ya existe' });
    await L.setUser(u, { salt: '', hash: '', char });
    res.json({ token: await L.newSession(u) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
