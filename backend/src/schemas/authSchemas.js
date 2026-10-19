const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

module.exports = {
  authSchema,
};
