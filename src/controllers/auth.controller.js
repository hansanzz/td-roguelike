// Capa HTTP de cuentas: lee la petición, llama al servicio y arma la respuesta.
const auth = require('../services/auth.service');
const session = require('../middleware/session');

const credentials = req => [String(req.body.username || '').trim(), String(req.body.password || '')];

exports.register = async (req, res) => {
  const { token, user } = await auth.register(...credentials(req));
  session.setToken(res, token);
  res.status(201).json({ ok: true, ...user });
};
exports.login = async (req, res) => {
  const { token, user } = await auth.login(...credentials(req));
  session.setToken(res, token);
  res.json({ ok: true, ...user });
};
exports.me = async (req, res) => {
  const user = await auth.me(session.getToken(req));
  res.json(user ? { logged: true, ...user } : { logged: false });
};
exports.logout = async (req, res) => {
  await auth.logout(session.getToken(req));
  res.json({ ok: true });
};
