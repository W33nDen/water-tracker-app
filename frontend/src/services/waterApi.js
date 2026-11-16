import api from './api';

/**
 * GET /api/water/today?tz=<IANA zone>
 * Returns today's water records + percentage of daily norm achieved.
 * Automatically passes the browser's IANA timezone.
 *
 * @returns {Promise<{ records: Array<{id: string, volume: number, time: string}>, percentage: number }>}
 */
export async function getTodayWater() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data } = await api.get('/water/today', { params: { tz } });
  return data;
}

/**
 * POST /api/water
 * Adds a new water record.
 *
 * @param {{ volume: number, time: string }} payload
 * @returns {Promise<{ id: string, volume: number, time: string }>}
 */
export async function addWater(payload) {
  const { data } = await api.post('/water', payload);
  return data;
}

/**
 * PUT /api/water/:id
 * Updates an existing water record.
 *
 * @param {string} id
 * @param {{ volume?: number, time?: string }} payload
 * @returns {Promise<{ id: string, volume: number, time: string }>}
 */
export async function updateWater(id, payload) {
  const { data } = await api.put(`/water/${id}`, payload);
  return data;
}

/**
 * DELETE /api/water/:id
 * Deletes a water record.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteWater(id) {
  await api.delete(`/water/${id}`);
}
