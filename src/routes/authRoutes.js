const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, me } = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/me', me);

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6, max: 72 })
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1, max: 72 })
  ],
  validate,
  login
);

router.post('/logout', logout);

module.exports = router;
