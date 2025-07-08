const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: "User already exists" });

  const user = await User.create({ username, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: "Invalid user data" });
  }
};

// Login user
const loginUser = async (req, res) => {
  console.log(`Login attempt with body: ${JSON.stringify(req.body)}`);
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ error: "Invalid email or password" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
