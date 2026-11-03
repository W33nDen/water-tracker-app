const express = require('express');
const authenticate = require('../middlewares/authenticate');
const validateBody = require('../middlewares/validateBody');
const { uploadSingle } = require('../middlewares/upload');
const { editUserSchema } = require('../schemas/usersSchemas');
const usersController = require('../controllers/usersController');

const router = express.Router();

/**
 * @route GET /api/users/current
 * @desc Get current user profile
 * @access Private
 * @responses
 *   200 - OK { email, name, gender, dailyNorma, avatarUrl }
 *   401 - Unauthorized
 */
router.get('/current', authenticate, usersController.getCurrent);

/**
 * @route PATCH /api/users/avatar
 * @desc Upload a new avatar to Cloudinary
 * @access Private
 * @body multipart/form-data, field "avatar" (JPEG/PNG/WEBP/GIF, max 5 MB)
 * @responses
 *   200 - OK { avatarUrl }
 *   400 - No file / wrong type / too large
 *   401 - Unauthorized
 *   502 - Cloudinary upload failed
 */
router.patch('/avatar', authenticate, uploadSingle('avatar'), usersController.updateAvatar);

/**
 * @route PATCH /api/users/edit
 * @desc Update profile: name, gender, email, password
 * @access Private
 * @body { name?, gender?, email?, oldPassword?, password? } — at least one field;
 *       oldPassword and password (new) must be sent together
 * @responses
 *   200 - OK { email, name, gender, dailyNorma, avatarUrl }
 *   400 - Validation error / outdated password is wrong
 *   401 - Unauthorized
 *   409 - Email in use
 */
router.patch('/edit', authenticate, validateBody(editUserSchema), usersController.updateProfile);

module.exports = router;
