const ContactMessage = require('../models/ContactMessage');

async function submit(req, res) {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    orderId: req.body.orderId || '',
    subject: req.body.subject || 'Order question',
    message: req.body.message,
    user: (req.session && req.session.user) ? req.session.user.id : null
  };

  const msg = await ContactMessage.create(payload);
  res.status(201).json({ message: msg });
}

module.exports = { submit };
