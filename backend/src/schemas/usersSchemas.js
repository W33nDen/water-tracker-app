const Joi = require('joi');

/**
 * PATCH /api/users/edit
 * All fields optional, at least one required.
 * Changing the password requires the current one (oldPassword).
 * Field names follow the ТЗ «UserInfo» validation rules.
 */
const editUserSchema = Joi.object({
  name: Joi.string().trim().max(32).allow(''),
  gender: Joi.string().valid('female', 'male'),
  email: Joi.string().trim().email(),
  oldPassword: Joi.string().min(8).max(64),
  password: Joi.string().min(8).max(64),
})
  .min(1)
  .and('oldPassword', 'password')
  .messages({
    'object.min': 'At least one field must be provided',
    'object.and': 'Both oldPassword and password are required to change the password',
  });

module.exports = {
  editUserSchema,
};
