const Interaction = require("../model/interactionModel");

const checkMatchBetweenUsers = async (userA, userB) => {
  return await Interaction.findOne({
    $or: [
      { from: userA, to: userB, status: "ACCEPTED" },
      { from: userB, to: userA, status: "ACCEPTED" },
    ],
  });
};

module.exports = checkMatchBetweenUsers;
