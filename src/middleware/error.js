function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  const message = status === 500 ? 'Server error' : err.message;
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
