/**
 * Handles requests to undefined routes.
 */
const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found — ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
