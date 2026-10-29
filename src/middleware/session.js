// Sesión por cookie HttpOnly. El token se valida dentro de SQL (tabla sessions).
const config = require('../config');

const { name, maxAgeMs } = config.cookie;

exports.getToken = req => ((req.headers.cookie || '').split('; ').find(c => c.startsWith(name + '=')) || '').slice(name.length + 1);
exports.setToken = (res, token) => res.setHeader('Set-Cookie', `${name}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeMs / 1000}`);
