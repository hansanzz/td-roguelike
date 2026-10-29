// Capa HTTP de puntajes.
const scores = require('../services/score.service');
const session = require('../middleware/session');

exports.save = async (req, res) => {
  const score = parseInt(req.body.score) || 0, wave = parseInt(req.body.wave) || 0;
  res.json(await scores.save(session.getToken(req), score, wave));
};
exports.leaderboard = async (req, res) => res.json(await scores.leaderboard());
