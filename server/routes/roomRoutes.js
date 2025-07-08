const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  joinRoom,
} = require("../controllers/roomController");

const authmiddleware = require("../middlewares/authmiddleware");

router.get("/test", (req, res) => {
  return res.json({ message: "Welcome to the room API" });
});

router.post("/create", authmiddleware, createRoom);
router.get("/", getRooms);
router.post("/join", authmiddleware, joinRoom);
module.exports = router;
