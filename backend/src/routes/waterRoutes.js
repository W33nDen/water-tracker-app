const express = require('express');
const authenticate = require('../middlewares/authenticate');
const validateBody = require('../middlewares/validateBody');
const { createWaterSchema, updateWaterSchema } = require('../schemas/waterSchemas');
const waterController = require('../controllers/waterController');

const router = express.Router();

/**
 * @route GET /api/water/today
 * @desc  Get today's water records + percentage of daily norm
 * @access Private
 * @query { tz?: string } — IANA timezone (defaults to UTC)
 * @responses
 *   200 - OK { records: [{ id, volume, time }], percentage: number }
 *   401 - Unauthorized
 */
router.get('/today', authenticate, waterController.getTodayWater);

/**
 * @route POST /api/water
 * @desc  Add a new water record
 * @access Private
 * @body { volume: number (1–5000 ml), time: string (ISO-8601 with offset) }
 * @responses
 *   201 - Created { id, volume, time }
 *   400 - Validation error
 *   401 - Unauthorized
 */
router.post('/', authenticate, validateBody(createWaterSchema), waterController.addWater);

/**
 * @route PUT /api/water/:id
 * @desc  Update a water record (must belong to the current user)
 * @access Private
 * @body { volume?: number, time?: string } — at least one field
 * @responses
 *   200 - OK { id, volume, time }
 *   400 - Validation error / empty body
 *   401 - Unauthorized
 *   404 - Not found or not owned by user
 */
router.put('/:id', authenticate, validateBody(updateWaterSchema), waterController.editWater);

/**
 * @route DELETE /api/water/:id
 * @desc  Delete a water record (must belong to the current user)
 * @access Private
 * @responses
 *   204 - No Content
 *   401 - Unauthorized
 *   404 - Not found or not owned by user
 */
router.delete('/:id', authenticate, waterController.removeWater);

module.exports = router;
