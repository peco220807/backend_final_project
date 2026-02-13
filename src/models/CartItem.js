const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1, max: 50, default: 1 }
  },
  { timestamps: true }
);

CartItemSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', CartItemSchema);
