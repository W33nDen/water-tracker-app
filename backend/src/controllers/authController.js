const authService = require('../services/authService');
const { setAuthCookie, clearAuthCookie } = require('../helpers/authCookie');

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

/**
 * Handles user logout.
 */
const logout = async (req, res) => {
  await authService.logout(req.userId);
  clearAuthCookie(res);
  res.status(204).send();
};

module.exports = {
  signup,
  signin,
  logout,
};
