import api from './api';

/**
 * PATCH /api/users/avatar (multipart, field "avatar") → { avatarUrl }
 * The api instance defaults to Content-Type: application/json, which makes axios
 * serialize FormData to JSON (the file is lost). Setting multipart/form-data here
 * lets axios send the real file; the browser adds the boundary itself.
 */
export async function updateAvatarRequest(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * PATCH /api/users/edit → updated public user
 * @param {{ name?: string, gender?: 'female'|'male', email?: string, oldPassword?: string, password?: string }} changes
 */
export async function updateProfileRequest(changes) {
  const { data } = await api.patch('/users/edit', changes);
  return data;
}

/**
 * PATCH /api/users/water-rate → updated public user with new dailyNorma (in ml)
 * @param {number} dailyNorma - Daily water intake rate in milliliters (1..15000)
 */
export async function updateWaterRateRequest(dailyNorma) {
  const { data } = await api.patch('/users/water-rate', { dailyNorma });
  return data;
}
