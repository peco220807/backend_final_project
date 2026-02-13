const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    orderId: { type: String, default: '', trim: true, maxlength: 64 },
    subject: { type: String, default: 'Order question', trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
