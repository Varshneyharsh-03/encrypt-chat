const mongoose = require("mongoose");
const Room = require("../models/Room");

const createRoom = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  try {
    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ error: "Room already exists" });
    }
    const room = await Room.create({
      name,
      createdBy: userId,
      members: [userId],
    });
    return res.status(201).json({
      msg: "Room created successfully",
      room: {
        _id: room._id,
        name: room.name,
        createdBy: room.createdBy,
        members: room.members,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "username email");
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const joinRoom = async (req, res) => {
  const { roomId } = req.body;
  const userId = req.user.id;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (room.members.includes(userId)) {
      return res.status(400).json({ error: "User already in room" });
    }
    room.members.push(userId);
    await room.save();
    return res.status(200).json({
      msg: "User added to room successfully",
      room: {
        _id: room._id,
        name: room.name,
        createdBy: room.createdBy,
        members: room.members,
      },
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getRooms, createRoom, joinRoom };
