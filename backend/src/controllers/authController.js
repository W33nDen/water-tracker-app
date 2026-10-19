const authService = require('../services/authService');
const { setAuthCookie } = require('../helpers/authCookie');

/**
 * Handles user registration.
 */
const signup = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.register(email, password);

  setAuthCookie(res, result.token);

  res.status(201).json(result);
};

module.exports = {
  signup,
};
