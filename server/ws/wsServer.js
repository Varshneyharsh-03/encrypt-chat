const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const { encrypt } = require("../utils/encryption");

// In-memory maps for client and room tracking
const clients = new Map(); // userId => socket
const userRooms = new Map(); // userId => currentRoom
const rooms = new Map(); // roomId => Set of userIds

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url.replace("/", ""));
    const token = urlParams.get("token");

    let userId = null;

    // 🔐 Authenticate the user
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      clients.set(userId, ws);
      console.log(`✅ Authenticated user: ${userId}`);
    } catch (err) {
      console.error("❌ Invalid token:", err.message);
      ws.close();
      return;
    }

    // 📥 Handle incoming WebSocket messages
    ws.on("message", async (rawData) => {
      try {
        const data = JSON.parse(rawData);
        const { type } = data;

        switch (type) {
          case "JOIN":
            return handleJoin(ws, userId, data);

          case "MESSAGE":
            return await handleMessage(ws, userId, data);

          default:
            return ws.send(
              JSON.stringify({ error: "❌ Unknown message type." })
            );
        }
      } catch (err) {
        console.error("❌ WS Parse/Processing Error:", err.message);
        ws.send(JSON.stringify({ error: "Failed to process message." }));
      }
    });

    // 🔌 Handle disconnection
    ws.on("close", () => {
      const roomId = userRooms.get(userId);
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(userId);
        console.log(`👋 ${userId} left room ${roomId}`);
      }

      clients.delete(userId);
      userRooms.delete(userId);
    });
  });

  console.log("✅ WebSocket server initialized");
}

// 👥 JOIN a room
function handleJoin(ws, userId, data) {
  const { roomId } = data;

  if (!roomId) {
    return ws.send(JSON.stringify({ error: "Room ID is required to join." }));
  }

  userRooms.set(userId, roomId);

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  rooms.get(roomId).add(userId);

  console.log(`👥 ${userId} joined room ${roomId}`);

  ws.send(JSON.stringify({ type: "JOIN_SUCCESS", roomId }));
}

// 💬 Handle MESSAGE
async function handleMessage(ws, userId, data) {
  const roomId = userRooms.get(userId);

  if (!roomId) {
    return ws.send(
      JSON.stringify({ error: "Join a room before sending messages." })
    );
  }

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return ws.send(
      JSON.stringify({ error: "Invalid roomId: Not a valid ObjectId" })
    );
  }

  const { text } = data;

  if (!text || typeof text !== "string") {
    return ws.send(JSON.stringify({ error: "Invalid message text." }));
  }

  const encryptedText = encrypt(text);

  const savedMsg = await Message.create({
    roomId: new mongoose.Types.ObjectId(roomId),
    sender: userId,
    text: encryptedText,
  });

  const payload = {
    type: "MESSAGE",
    payload: {
      _id: savedMsg._id,
      sender: userId,
      roomId,
      text, // plain text for clients
      createdAt: savedMsg.createdAt,
    },
  };

  broadcastToRoom(roomId, payload);
}

// 📤 Broadcast message to all users in the room
function broadcastToRoom(roomId, payload) {
  const userSet = rooms.get(roomId);
  if (!userSet) return;

  userSet.forEach((uid) => {
    const clientSocket = clients.get(uid);
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(JSON.stringify(payload));
    }
  });
}

module.exports = initWebSocket;
