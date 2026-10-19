const HttpError = require('../helpers/HttpError');

/**
 * Middleware factory for validating request body against a Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {import('express').RequestHandler}
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body ?? {}, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(HttpError(400, error.message));
  }

  req.body = value;
  next();
};

module.exports = validateBody;
