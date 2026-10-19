const defaultMessages = {
  400: 'Bad Request',
  401: 'Not authorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Server error',
};

/**
 * Creates an Error instance with an HTTP status code.
 *
 * @param {number} status - HTTP status code
 * @param {string} [message] - Error message
 * @returns {Error}
 */
const HttpError = (status, message = defaultMessages[status] || 'Error') => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = HttpError;
