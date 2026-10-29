const router = require('express').Router();
const wrap = require('../utils/asyncHandler');
const c = require('../controllers/auth.controller');

router.post('/register', wrap(c.register));
router.post('/login', wrap(c.login));
router.get('/me', wrap(c.me));
router.post('/logout', wrap(c.logout));

module.exports = router;
