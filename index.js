const http = require("http");
const app = require("./server");
const initSocket = require("./socket");

const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 8888;  // fallback for local dev
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

