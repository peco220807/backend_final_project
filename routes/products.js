const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const db = getDB();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { name, price, category, image, description } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: "Name and price required" });
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  try {
    const db = getDB();
    const result = await db.collection("products").insertOne({
      name: name.trim(),
      price: numericPrice,
      category: category || null,
      image: image || null,
      description: description || null,
      createdAt: new Date(),
    });

    const created = await db
      .collection("products")
      .findOne({ _id: result.insertedId });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const { name, price, category, image, description } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: "Name and price required" });
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  try {
    const db = getDB();
    const result = await db.collection("products").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name.trim(),
          price: numericPrice,
          category: category || null,
          image: image || null,
          description: description || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const db = getDB();
    const result = await db
      .collection("products")
      .findOneAndDelete({ _id: new ObjectId(id) });

    if (!result.value) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;