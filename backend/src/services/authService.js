const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const HttpError = require('../helpers/HttpError');
const { publicUserSelect } = require('../helpers/userSelect');

/**
 * Registers a new user.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
const register = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw HttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: {
      id: true,
      ...publicUserSelect,
    },
  });

  const token = jwt.sign({ id: newUser.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Persist session token in database for single-session tracking
  await prisma.user.update({
    where: { id: newUser.id },
    data: { token },
  });

  const { id: _id, ...publicUser } = newUser;

  return {
    token,
    user: publicUser,
  };
};

/**
 * Authenticates an existing user.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const token = jwt.sign({ id: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Update session token in database, invalidating previous session
  await prisma.user.update({
    where: { id: user.id },
    data: { token },
  });

  return {
    token,
    user: {
      email: user.email,
      name: user.name,
      gender: user.gender,
      dailyNorma: user.dailyNorma,
      avatarUrl: user.avatarUrl,
    },
  };
};

/**
 * Logs out user by clearing the session token in the database.
 *
 * @param {string} userId
 * @returns {Promise<void>}
 */
const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { token: null },
  });
};

module.exports = {
  register,
  login,
  logout,
};
