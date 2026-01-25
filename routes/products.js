const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../database/mongo');
const router = express.Router();
function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const col = db.collection('products');

    const {
      category,
      q,
      minPrice,
      maxPrice,
      sort,
      fields,
      limit,
      skip
    } = req.query;

    const filter = {};

    if (category) filter.category = category;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null && !Number.isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice != null && !Number.isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    let projection = undefined;
    if (fields) {
      projection = {};
      fields.split(',').map(s => s.trim()).filter(Boolean).forEach((f) => {
        projection[f] = 1;
      });
    }

    let sortObj = { _id: 1 };
    if (sort) {
      const s = String(sort).trim();
      const desc = s.startsWith('-');
      const field = desc ? s.slice(1) : s;

      const allowed = new Set(['name', 'price', 'category', '_id', 'createdAt']);
      if (!allowed.has(field)) {
        return res.status(400).json({ error: 'Invalid sort field' });
      }

      sortObj = { [field]: desc ? -1 : 1 };
    }

    const lim = limit != null ? Number(limit) : 0;
    const sk = skip != null ? Number(skip) : 0;

    if ((limit != null && Number.isNaN(lim)) || (skip != null && Number.isNaN(sk))) {
      return res.status(400).json({ error: 'Invalid limit/skip' });
    }

    const cursor = col
      .find(filter, projection ? { projection } : {})
      .sort(sortObj)
      .skip(sk);

    if (lim > 0) cursor.limit(lim);

    const items = await cursor.toArray();

    return res.status(200).json(items);
  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const db = getDB();
    const col = db.collection('products');

    const item = await col.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(item);
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body || {};

    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    const db = getDB();
    const col = db.collection('products');

    const doc = {
      name: String(name).trim(),
      price: numericPrice,
      category: category ? String(category).trim() : null,
      image: image ? String(image).trim() : null,
      description: description ? String(description).trim() : null,
      createdAt: new Date()
    };

    const result = await col.insertOne(doc);
    const created = await col.findOne({ _id: result.insertedId });

    return res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const { name, price, category, image, description } = req.body || {};

    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    const db = getDB();
    const col = db.collection('products');

    const update = {
      $set: {
        name: String(name).trim(),
        price: numericPrice,
        category: category ? String(category).trim() : null,
        image: image ? String(image).trim() : null,
        description: description ? String(description).trim() : null,
        updatedAt: new Date()
      }
    };

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(result.value);
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const db = getDB();
    const col = db.collection('products');

    const result = await col.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result.value) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;