const { v2: cloudinary } = require('cloudinary');
const config = require('../config');
const HttpError = require('./HttpError');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Uploads a user's avatar to Cloudinary from an in-memory buffer.
 * One image per user (public_id = userId, overwrite), so old avatars don't pile up.
 *
 * @param {Buffer} buffer - Image file contents (from multer memoryStorage)
 * @param {string} userId
 * @returns {Promise<string>} secure URL of the uploaded image
 */
const uploadAvatar = (buffer, userId) => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return Promise.reject(HttpError(500, 'Avatar storage is not configured'));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'water-tracker/avatars',
        public_id: userId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [{ width: 250, height: 250, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) return reject(HttpError(502, 'Avatar upload failed'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = {
  uploadAvatar,
};
