const jwt = require("jsonwebtoken");

const generateToken = (userid) => {
  const token = jwt.sign({ id: userid }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  console.log("Generated Token:", token);
  return token;
};

module.exports = generateToken;
