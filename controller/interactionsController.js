const Interaction = require("../model/interactionModel");
const Match = require("../model/matchModel");
const { User } = require("../model/userModel");

const sendSignal = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { to, type, meta } = req.body;

    if (!to || !type) {
      return res.status(400).json({ message: "to and type are required" });
    }

    if (to === senderId) {
      return res
        .status(400)
        .json({ message: "Cannot send signal to yourself" });
    }

    const existing = await Interaction.findOne({
      from: senderId,
      to,
      status: "SENT",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already sent this signal to this user" });
    }

    const interaction = await Interaction.create({
      from: senderId,
      to,
      type,
      meta: meta || {},
      status: "SENT",
    });

    return res.status(200).json({ message: "Signal sent", interaction });
  } catch (error) {
    console.log("sendSignal error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const respondSignal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interactionId, action } = req.body;

    if (!interactionId || !action) {
      return res
        .status(400)
        .json({ message: "interactionId and action are required" });
    }

    if (!["ACCEPTED", "REJECTED"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const interaction = await Interaction.findOne({
      _id: interactionId,
      to: userId,
    });

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    if (interaction.status !== "SENT") {
      return res.status(400).json({ message: "Interaction already processed" });
    }

    interaction.status = action;
    await interaction.save();

    if (action === "ACCEPTED") {
      const existingMatch = await Match.findOne({
        users: { $all: [interaction.from, interaction.to] },
      });

      if (!existingMatch) {
        await Match.create({
          users: [interaction.from, interaction.to],
        });
      }
    }

    return res.status(200).json({
      message: `Signal ${action.toLowerCase()}`,
      interaction,
    });
  } catch (error) {
    console.log("respondSignal error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMatchStatus = async (req, res) => {
  try {
    const fromUser = req.user.id;
    const toUser = req.params.toUserId;

    const interaction = await Interaction.findOne({
      $or: [
        { from: fromUser, to: toUser },
        { from: toUser, to: fromUser },
      ],
    });

    if (!interaction) return res.status(200).json({ status: "NONE" });

    if (interaction.status === "SENT")
      return res.status(200).json({ status: "REQUESTED" });
    if (interaction.status === "ACCEPTED")
      return res.status(200).json({ status: "MATCHED" });

    return res.status(200).json({ status: "NONE" });
  } catch (error) {
    console.log("getMatchStatus error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const listReceivedSignals = async (req, res) => {
  try {
    const userId = req.user.id;
    const interactions = await Interaction.find({
      to: userId,
      status: "SENT",
    })

      .populate("from", "name age gender profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: interactions.length, interactions });
  } catch (error) {
    console.log("listReceivedSignals error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const listSentSignals = async (req, res) => {
  try {
    const userId = req.user.id;
    const interactions = await Interaction.find({ from: userId })
      .populate("to", "name age gender profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: interactions.length, interactions });
  } catch (error) {
    console.log("listSentSignals error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendSignal,
  respondSignal,
  listReceivedSignals,
  listSentSignals,
  getMatchStatus,
};
