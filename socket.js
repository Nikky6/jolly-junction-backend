const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔥 Socket connected:", socket.userId);

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`👥 User ${socket.userId} joined chat room ${chatId}`);
    });

    socket.on("send-message", ({ chatId, message }) => {
      const msg = {
        chatId,
        sender: socket.userId,
        message,
        createdAt: new Date(),
      };

      io.to(chatId).emit("receive-message", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.userId);
    });
  });
};

module.exports = initSocket;
