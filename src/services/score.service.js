// Lógica de puntajes: delega en los procedimientos de SQL.
const db = require('../db/procedures');

exports.save = async (token, score, wave) => (await db.call('sp_save_score', [token, score, wave]))[0];
exports.leaderboard = () => db.call('sp_leaderboard');
