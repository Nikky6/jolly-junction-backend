const http = require("http");
const app = require("./server");
const initSocket = require("./socket");

const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
