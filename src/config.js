// Configuración central. Cada valor se puede cambiar con variables de entorno.
const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '127.0.0.1',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'td_roguelike',
  },
  cookie: { name: 'tk', maxAgeMs: 7 * 24 * 3600 * 1000 },
  publicDir: path.join(__dirname, '..', 'public'),
};
