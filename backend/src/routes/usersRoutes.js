const express = require('express');
const authenticate = require('../middlewares/authenticate');
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

module.exports = router;
