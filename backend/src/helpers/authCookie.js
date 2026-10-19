const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Common cookie options matching authentication requirements.
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSameSite,
  path: '/',
});

/**
 * Sets the httpOnly auth cookie on the response.
 *
 * @param {import('express').Response} res
 * @param {string} token - JWT token
 */
const setAuthCookie = (res, token) => {
  const decoded = jwt.decode(token);
  const maxAge = decoded && decoded.exp ? decoded.exp * 1000 - Date.now() : undefined;

  res.cookie('token', token, {
    ...getCookieOptions(),
    ...(maxAge ? { maxAge } : {}),
  });
};

/**
 * Clears the auth cookie using the exact same path and flags.
 *
 * @param {import('express').Response} res
 */
const clearAuthCookie = (res) => {
  res.clearCookie('token', getCookieOptions());
};

module.exports = {
  setAuthCookie,
  clearAuthCookie,
};
