const usersService = require('../services/usersService');
const HttpError = require('../helpers/HttpError');

/**
 * Returns the current authenticated user's profile.
 * Exactly public fields: email, name, gender, dailyNorma, avatarUrl.
 */
const getCurrent = (req, res) => {
  res.status(200).json(req.user);
};

/**
 * Uploads a new avatar (multipart field "avatar") and returns its URL.
 */
const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, 'Avatar file is required (field "avatar")');
  }
  const result = await usersService.updateAvatar(req.userId, req.file.buffer);
  res.status(200).json(result);
};

/**
 * Updates profile fields and returns the updated public user.
 */
const updateProfile = async (req, res) => {
  const user = await usersService.updateProfile(req.userId, req.body);
  res.status(200).json(user);
};

module.exports = {
  getCurrent,
  updateAvatar,
  updateProfile,
};
