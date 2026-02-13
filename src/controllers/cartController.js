const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

async function getCart(req, res) {
  const items = await CartItem.find({ user: req.user.id }).populate('product');
  const normalized = items
    .filter(i => i.product && i.product.isActive)
    .map(i => ({
      id: String(i._id),
      qty: i.qty,
      product: {
        id: String(i.product._id),
        name: i.product.name,
        price: i.product.price,
        image: i.product.image,
        category: i.product.category
      },
      lineTotal: i.qty * i.product.price
    }));

  const total = normalized.reduce((sum, it) => sum + it.lineTotal, 0);
  res.json({ items: normalized, total });
}

async function add(req, res) {
  const { productId, qty } = req.body;
  const p = await Product.findOne({ _id: productId, isActive: true });
  if (!p) return res.status(404).json({ error: 'Product not found' });

  const addQty = Math.max(1, Math.min(50, parseInt(qty || 1, 10)));

  const item = await CartItem.findOneAndUpdate(
    { user: req.user.id, product: p._id },
    { $inc: { qty: addQty } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (item.qty > 50) {
    item.qty = 50;
    await item.save();
  }

  res.status(201).json({ ok: true });
}

async function setQty(req, res) {
  const qty = Math.max(1, Math.min(50, parseInt(req.body.qty, 10)));
  const item = await CartItem.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { qty } },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}

async function removeItem(req, res) {
  const out = await CartItem.deleteOne({ _id: req.params.id, user: req.user.id });
  if (out.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}

async function clear(req, res) {
  await CartItem.deleteMany({ user: req.user.id });
  res.json({ ok: true });
}

module.exports = { getCart, add, setQty, removeItem, clear };
