const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

async function seedProducts() {
  const count = await Product.countDocuments({});
  if (count > 0) return;

  const filePath = path.join(__dirname, '../../data/products.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const products = JSON.parse(raw);

  await Product.insertMany(products.map(p => ({ ...p, isActive: true })));
}

module.exports = { seedProducts };
