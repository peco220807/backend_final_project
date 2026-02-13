const express = require('express');
const ctrl = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, ctrl.createOrder);
router.get('/my', requireAuth, ctrl.myOrders);
router.get('/admin/all', requireRole('admin'), ctrl.adminAll);

module.exports = router;
