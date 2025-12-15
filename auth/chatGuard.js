const checkMatchBetweenUsers = require("../utils/checkMatch");

const chatGuard = async (req, res, next) => {
  const userId = req.user.id;
  const otherUserId = req.params.userId;

  const match = await checkMatchBetweenUsers(userId, otherUserId);

  if (!match) {
    return res.status(403).json({ message: "Chat locked" });
  }

  next();
};

module.exports = chatGuard;
