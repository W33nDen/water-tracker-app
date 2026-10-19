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

/**
 * Handles user login.
 */
const signin = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  setAuthCookie(res, result.token);

  res.status(200).json(result);
};

module.exports = {
  signup,
  signin,
};
