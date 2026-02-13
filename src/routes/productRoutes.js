const express = require('express');
const { body, param, query } = require('express-validator');
const ctrl = require('../controllers/productController');
const { requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1, max: 10000 }),
    query('limit').optional().isInt({ min: 1, max: 24 }),
    query('category').optional().isString().isLength({ min: 1, max: 60 })
  ],
  validate,
  ctrl.list
);

router.get('/categories', ctrl.categories);

router.get(
  '/:id',
  [param('id').isMongoId()],
  validate,
  ctrl.getOne
);

router.post(
  '/',
  requireRole('admin'),
  [
    body('name').isString().isLength({ min: 2, max: 120 }).trim(),
    body('category').isString().isLength({ min: 2, max: 60 }).trim(),
    body('price').isFloat({ min: 0 }),
    body('description').isString().isLength({ min: 10, max: 1000 }).trim(),
    body('image').isString().isLength({ min: 4, max: 200 }).trim()
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('name').optional().isString().isLength({ min: 2, max: 120 }).trim(),
    body('category').optional().isString().isLength({ min: 2, max: 60 }).trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('description').optional().isString().isLength({ min: 10, max: 1000 }).trim(),
    body('image').optional().isString().isLength({ min: 4, max: 200 }).trim(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  ctrl.update
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isMongoId()],
  validate,
  ctrl.remove
);

module.exports = router;
