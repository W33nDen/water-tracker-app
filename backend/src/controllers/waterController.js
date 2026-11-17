const waterService = require('../services/waterService');

/**
 * POST /api/water
 * Creates a new water record.
 * @body { volume: number, time: string }
 * @returns 201 { id, volume, time }
 */
const addWater = async (req, res) => {
  const record = await waterService.createWater(req.userId, req.body);
  res.status(201).json(record);
};

/**
 * PUT /api/water/:id
 * Updates an existing water record (must belong to the authenticated user).
 * @body { volume?: number, time?: string } — at least one field
 * @returns 200 { id, volume, time }
 */
const editWater = async (req, res) => {
  const record = await waterService.updateWater(req.userId, req.params.id, req.body);
  res.status(200).json(record);
};

/**
 * DELETE /api/water/:id
 * Deletes a water record (must belong to the authenticated user).
 * @returns 204 No Content
 */
const removeWater = async (req, res) => {
  await waterService.deleteWater(req.userId, req.params.id);
  res.status(204).send();
};

/**
 * GET /api/water/today?tz=<IANA zone>
 * Returns today's records and the percentage of the daily norm achieved.
 * @query tz - IANA timezone string (e.g. "Europe/Kyiv"). Defaults to UTC.
 * @returns 200 { records: [{ id, volume, time }], percentage: number }
 */
const getTodayWater = async (req, res) => {
  const tz = req.query.tz || 'UTC';
  const data = await waterService.getTodayWater(req.userId, tz);
  res.status(200).json(data);
};

module.exports = { addWater, editWater, removeWater, getTodayWater };
