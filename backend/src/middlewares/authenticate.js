const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const HttpError = require('../helpers/HttpError');
const { publicUserSelect } = require('../helpers/userSelect');

/**
 * Authenticates incoming requests.
 * Checks httpOnly cookie first (primary transport per specs);
 * falls back to Authorization: Bearer <token> (client compatibility).
 *
 * Verifies JWT signature and checks token match in the database to support
 * session invalidation upon logout or concurrent signin.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  // 1. Try reading token from cookie first
  let token = req.cookies?.token;

  // 2. If cookie is not present, fall back to Authorization header
  if (!token) {
    const [type, value] = (req.headers.authorization ?? '').split(' ');
    if (type === 'Bearer' && value) {
      token = value;
    }
  }

  if (!token) {
    throw HttpError(401, 'Not authorized');
  }

  // 3. Verify JWT signature and expiration
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw HttpError(401, 'Not authorized');
  }

  if (!payload?.id) {
    throw HttpError(401, 'Not authorized');
  }

  // 4. Verify user exists and token matches current session in database
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      ...publicUserSelect,
      token: true,
    },
  });

  if (!user || user.token !== token) {
    throw HttpError(401, 'Not authorized');
  }

  // 5. Attach public user data and internal userId to req
  const { id, token: _userToken, ...publicUser } = user;
  req.user = publicUser;
  req.userId = id;

  next();
};

module.exports = authenticate;
