const express = require("express");
const chatRoutes = express.Router();
const authenticate = require("../auth/middleware");
const chatControllers = require("../controller/chatController");

chatRoutes.post(
  "/chat/get-or-create",
  authenticate,
  chatControllers.getOrCreateChat
);

chatRoutes.post("/chat/send", authenticate, chatControllers.sendMessage);

chatRoutes.get(
  "/chat/messages/:chatId",
  authenticate,
  chatControllers.getMessages
);

module.exports = chatRoutes;
