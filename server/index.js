const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/message", messageRoutes);

const server = http.createServer(app);
const initWebSocket = require("./ws/wsServer");
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
