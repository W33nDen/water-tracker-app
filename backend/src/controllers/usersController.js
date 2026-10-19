/**
 * Returns the current authenticated user's profile.
 * Exactly public fields: email, name, gender, dailyNorma, avatarUrl.
 */
const getCurrent = (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  getCurrent,
};
