const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, max: 50 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['created', 'paid', 'shipped', 'cancelled'], default: 'created' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
