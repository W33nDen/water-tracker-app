const Joi = require('joi');

/**
 * POST /api/water
 * volume: integer milliliters 1..5000
 * time:   ISO-8601 string with offset (e.g. "2026-11-16T10:30:00+02:00")
 */
const createWaterSchema = Joi.object({
  volume: Joi.number().integer().min(1).max(5000).required().messages({
    'number.base': '"volume" must be a number',
    'number.integer': '"volume" must be an integer',
    'number.min': '"volume" must be at least 1 ml',
    'number.max': '"volume" must be at most 5000 ml',
    'any.required': '"volume" is required',
  }),
  time: Joi.string().isoDate().required().messages({
    'string.isoDate': '"time" must be a valid ISO-8601 date string',
    'any.required': '"time" is required',
  }),
});

/**
 * PUT /api/water/:id
 * Same fields but all optional; at least one must be present.
 */
const updateWaterSchema = Joi.object({
  volume: Joi.number().integer().min(1).max(5000).messages({
    'number.base': '"volume" must be a number',
    'number.integer': '"volume" must be an integer',
    'number.min': '"volume" must be at least 1 ml',
    'number.max': '"volume" must be at most 5000 ml',
  }),
  time: Joi.string().isoDate().messages({
    'string.isoDate': '"time" must be a valid ISO-8601 date string',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field (volume or time) must be provided',
  });

module.exports = { createWaterSchema, updateWaterSchema };
