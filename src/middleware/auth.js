function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = req.session.user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.session.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    req.user = req.session.user;
    next();
  };
}

module.exports = { requireAuth, requireRole };
