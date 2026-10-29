// Lógica de cuentas: delega en los procedimientos de SQL. Genera el token de sesión.
const crypto = require('crypto');
const db = require('../db/procedures');

const newToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (username, password) => {
  const token = newToken();
  const [user] = await db.call('sp_register', [username, password, token]);
  return { token, user };
};
exports.login = async (username, password) => {
  const token = newToken();
  const [user] = await db.call('sp_login', [username, password, token]);
  return { token, user };
};
exports.me = async token => (await db.call('sp_me', [token]))[0] || null;
exports.logout = token => db.call('sp_logout', [token]);
