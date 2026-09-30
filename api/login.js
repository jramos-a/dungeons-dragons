const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    const u = String((req.body || {}).user || '').trim().toLowerCase();
    if (!u || !(await L.getUser(u))) return res.status(401).json({ error: 'Ese usuario no existe' });
    res.json({ token: await L.newSession(u) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
