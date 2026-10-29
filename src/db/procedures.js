// Única puerta de entrada a la base: ejecuta procedimientos almacenados (sp_*).
// Los errores de negocio de SQL (SQLSTATE 45000) se convierten en AppError.
const pool = require('./pool');
const { AppError } = require('../errors');

async function call(name, args = []) {
  if (!/^sp_[a-z_]+$/.test(name)) throw new Error('Nombre de procedimiento inválido');
  try {
    const [sets] = await pool.query(`CALL ${name}(${args.map(() => '?').join(',')})`, args);
    return sets[0] || [];
  } catch (e) {
    if (e.sqlState === '45000') throw new AppError(e.sqlMessage, 400);
    throw e;
  }
}

module.exports = { call };
