const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessagesByRoomId,
} = require("../controllers/messageController");
const authmiddleware = require("../middlewares/authmiddleware");

router.post("/", authmiddleware, sendMessage);
router.get("/:roomId", authmiddleware, getMessagesByRoomId);

module.exports = router;
