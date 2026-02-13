const CartItem = require('../models/CartItem');
const Order = require('../models/Order');

async function createOrder(req, res) {
  const cart = await CartItem.find({ user: req.user.id }).populate('product');
  const active = cart.filter(i => i.product && i.product.isActive);

  if (active.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const items = active.map(i => ({
    productId: i.product._id,
    name: i.product.name,
    price: i.product.price,
    image: i.product.image,
    qty: i.qty
  }));

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const order = await Order.create({ user: req.user.id, items, total, status: 'created' });
  await CartItem.deleteMany({ user: req.user.id });

  res.status(201).json({ order });
}

async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ orders });
}

async function adminAll(req, res) {
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'email role');
  res.json({ orders });
}

module.exports = { createOrder, myOrders, adminAll };
