// Router de la API: /api/auth/* y /api/scores/*
const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/scores', require('./score.routes'));

module.exports = router;
