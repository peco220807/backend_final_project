const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', ctrl.getCart);

router.post(
  '/add',
  [
    body('productId').isMongoId(),
    body('qty').optional().isInt({ min: 1, max: 50 })
  ],
  validate,
  ctrl.add
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('qty').isInt({ min: 1, max: 50 })
  ],
  validate,
  ctrl.setQty
);

router.delete('/:id', [param('id').isMongoId()], validate, ctrl.removeItem);

router.post('/clear', ctrl.clear);

module.exports = router;
