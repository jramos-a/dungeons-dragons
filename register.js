const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    const { user, pass, char } = req.body || {};
    const u = String(user || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(u) || String(pass || '').length < 4)
      return res.status(400).json({ error: 'Usuario: 3-20 letras/números. Contraseña: mín. 4.' });
    if (await L.getUser(u)) return res.status(409).json({ error: 'Ese usuario ya existe' });
    const salt = L.crypto.randomBytes(16).toString('hex');
    await L.setUser(u, { salt, hash: L.hash(pass, salt), char });
    res.json({ token: await L.newSession(u) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
