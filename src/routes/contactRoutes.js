const express = require('express');
const { body } = require('express-validator');
const { submit } = require('../controllers/contactController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 2, max: 80 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('subject').optional().isString().isLength({ min: 2, max: 120 }).trim(),
    body('orderId').optional().isString().isLength({ max: 64 }).trim(),
    body('message').isString().isLength({ min: 10, max: 2000 }).trim()
  ],
  validate,
  submit
);

module.exports = router;
