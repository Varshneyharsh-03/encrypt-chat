const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.get("/test", (req, res) => {
  return res.json({ message: "Welcome to the authentication API" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
