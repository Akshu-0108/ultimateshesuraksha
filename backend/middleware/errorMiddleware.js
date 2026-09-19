// Catches requests to routes that don't exist -> 404
const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Catches any error passed via next(err) or thrown in an async controller
// (see asyncHandler.js) and returns a consistent { error: "..." } shape.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // If a status code was already set (e.g. 400 for bad input), keep it.
  // Otherwise default to 500.
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.message || "Something went wrong on the server",
  });
};

module.exports = { notFound, errorHandler };
