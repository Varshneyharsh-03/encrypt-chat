const mongoose = require("mongoose");
const User = require("./User");

const roomschema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomschema);
module.exports = Room;
