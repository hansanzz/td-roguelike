const router = require('express').Router();
const wrap = require('../utils/asyncHandler');
const c = require('../controllers/score.controller');

router.post('/', wrap(c.save));
router.get('/leaderboard', wrap(c.leaderboard));

module.exports = router;
