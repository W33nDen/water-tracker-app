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
  let statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message;

  // Handle Prisma unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Email in use';
  }

  // Handle invalid JSON payload from express.json()
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  // Hide internal error details in production for 500
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Server error';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
