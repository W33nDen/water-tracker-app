const express = require('express');
const validateBody = require('../middlewares/validateBody');
const { authSchema } = require('../schemas/authSchemas');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 * @body { email, password }
 * @responses
 *   201 - Created { token, user }
 *   400 - Validation error
 *   409 - Email in use
 */
router.post('/signup', validateBody(authSchema), authController.signup);

module.exports = router;
