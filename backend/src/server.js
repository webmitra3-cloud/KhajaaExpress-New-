require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const configureSocket = require("./config/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the process using port ${PORT} or change PORT in backend/.env.`);
      process.exit(1);
    }

    console.error("Server failed to start:", error);
    process.exit(1);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });

  app.set("io", io);
  configureSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
