const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const HttpError = require('../helpers/HttpError');
const { publicUserSelect } = require('../helpers/userSelect');
const { uploadAvatar } = require('../helpers/cloudinary');

/**
 * Uploads a new avatar and stores its URL.
 *
 * @param {string} userId
 * @param {Buffer} fileBuffer
 * @returns {Promise<{ avatarUrl: string }>}
 */
const updateAvatar = async (userId, fileBuffer) => {
  const url = await uploadAvatar(fileBuffer, userId);
  // Cloudinary keeps the same URL when overwriting, so bust browser caches.
  const avatarUrl = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { avatarUrl: true },
  });

  return { avatarUrl: user.avatarUrl };
};

/**
 * Updates profile fields: name, gender, email, password.
 *
 * @param {string} userId
 * @param {{ name?: string, gender?: string, email?: string, oldPassword?: string, password?: string }} data
 * @returns {Promise<object>} public user fields
 */
const updateProfile = async (userId, { name, gender, email, oldPassword, password }) => {
  const data = {};

  if (name !== undefined) data.name = name === '' ? null : name;
  if (gender !== undefined) data.gender = gender;

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    const owner = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (owner && owner.id !== userId) {
      throw HttpError(409, 'Email in use');
    }
    data.email = normalizedEmail;
  }

  if (password !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      // 400, not 401: the session is valid, only the entered password is wrong.
      throw HttpError(400, 'Outdated password is wrong');
    }
    data.password = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });
};

/**
 * Updates user's daily water intake rate (dailyNorma in milliliters).
 *
 * @param {string} userId
 * @param {number} dailyNorma
 * @returns {Promise<object>} public user fields
 */
const updateWaterRate = async (userId, dailyNorma) => {
  return prisma.user.update({
    where: { id: userId },
    data: { dailyNorma },
    select: publicUserSelect,
  });
};

module.exports = {
  updateAvatar,
  updateProfile,
  updateWaterRate,
};
