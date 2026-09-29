const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    const u = await L.whoami(req);
    const acc = u && await L.getUser(u);
    if (!acc) return res.status(401).json({ error: 'Sesión caducada' });
    if (req.method === 'GET') return res.json({ user: u, char: acc.char });
    if (req.method === 'PUT') { acc.char = req.body; await L.setUser(u, acc); return res.json({ ok: true }); }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
