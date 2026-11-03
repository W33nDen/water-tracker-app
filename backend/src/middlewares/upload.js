const multer = require('multer');
const HttpError = require('../helpers/HttpError');

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Keep the file in memory and stream it straight to Cloudinary — no temp files on disk.
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(HttpError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed'));
    }
    cb(null, true);
  },
});

/**
 * Accepts a single image in the given multipart field.
 * Converts multer errors into proper 400 responses.
 *
 * @param {string} fieldName
 * @returns {import('express').RequestHandler}
 */
const uploadSingle = (fieldName) => (req, res, next) => {
  multerUpload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB)' : `Upload error: ${err.message}`;
      return next(HttpError(400, message));
    }
    next(err);
  });
};

module.exports = {
  uploadSingle,
  MAX_AVATAR_SIZE,
};
