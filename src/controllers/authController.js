const bcrypt = require('bcrypt');
const User = require('../models/User');

function sanitizeUser(u) {
  return { id: String(u._id), email: u.email, role: u.role };
}

async function register(req, res) {
  const { email, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase().trim(), passwordHash, role: 'user' });

  req.session.user = sanitizeUser(user);
  res.json({ user: req.session.user });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.user = sanitizeUser(user);
  res.json({ user: req.session.user });
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('desire.sid');
    res.json({ ok: true });
  });
}

async function me(req, res) {
  if (!req.session.user) return res.status(200).json({ user: null });
  res.json({ user: req.session.user });
}

module.exports = { register, login, logout, me };
