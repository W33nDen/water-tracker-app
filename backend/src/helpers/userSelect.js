/**
 * Prisma select object for public user fields.
 * Never includes sensitive fields like password or token.
 */
const publicUserSelect = {
  email: true,
  name: true,
  gender: true,
  dailyNorma: true,
  avatarUrl: true,
};

module.exports = {
  publicUserSelect,
};
