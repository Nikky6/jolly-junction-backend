const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");

exports.getOrCreateChat = async (req, res) => {
  const userId = req.user.id;
  const { receiverId } = req.body;

  try {
    let chat = await Chat.findOne({
      members: { $all: [userId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({ members: [userId, receiverId] });
    }

    res.json({ chatId: chat._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const sender = req.user.id;
  const { chatId, message } = req.body;

  try {
    const newMessage = await Message.create({
      chat: chatId,
      sender,
      message,
    });

    res.json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
