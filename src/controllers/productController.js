const Product = require('../models/Product');

async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(24, Math.max(1, parseInt(req.query.limit || '12', 10)));
  const category = (req.query.category || '').trim();

  const filter = { isActive: true };
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    items,
    page,
    pages: Math.ceil(total / limit),
    total
  });
}

async function categories(req, res) {
  const cats = await Product.distinct('category', { isActive: true });
  res.json({ categories: cats.sort() });
}

async function getOne(req, res) {
  const p = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ product: p });
}

async function create(req, res) {
  const p = await Product.create({ ...req.body, createdBy: req.user.id, isActive: true });
  res.status(201).json({ product: p });
}

async function update(req, res) {
  const p = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body } },
    { new: true, runValidators: true }
  );
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ product: p });
}

async function remove(req, res) {
  const p = await Product.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}

module.exports = { list, categories, getOne, create, update, remove };
