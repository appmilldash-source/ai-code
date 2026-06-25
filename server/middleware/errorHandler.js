const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || {};

  res.status(status).json({
    error: message,
    status,
    details,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
