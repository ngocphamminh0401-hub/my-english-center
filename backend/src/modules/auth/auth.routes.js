const express = require('express');
const { authenticate } = require('../../middlewares/auth');
const { loginHandler, getMeHandler } = require('./auth.controller');

const router = express.Router();

router.post('/login', loginHandler);
router.get('/me', authenticate, getMeHandler);

module.exports = router;
