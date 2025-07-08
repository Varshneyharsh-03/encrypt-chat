const Message = require("../models/Message");
const { encrypt, decrypt } = require("../utils/encryption");

// 📨 Send a message (POST /api/messages)
const sendMessage = async (req, res) => {
  const { roomId, message } = req.body;
  const userId = req.user.id;

  try {
    if (!roomId || !userId || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🔐 Encrypt the message before saving
    const encryptedText = encrypt(message);

    const newMessage = await Message.create({
      roomId,
      sender: userId,
      text: encryptedText,
    });

    return res.status(200).json({
      msg: "Message sent successfully",
      data: {
        _id: newMessage._id,
        roomId: newMessage.roomId,
        sender: newMessage.sender,
        text: message, // send plain text to client
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📥 Get all messages in a room (GET /api/messages/:roomId)
const getMessagesByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    const messages = await Message.find({ roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    if (!messages.length) {
      return res.status(404).json({ error: "No messages found for this room" });
    }

    const decryptedMessages = messages.map((msg) => ({
      _id: msg._id,
      roomId: msg.roomId,
      sender: msg.sender, // populated with username
      text: decrypt(msg.text), // ✅ Decrypt correct field
      createdAt: msg.createdAt,
    }));

    return res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByRoomId,
};
