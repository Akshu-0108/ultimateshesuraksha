const jwt = require("jsonwebtoken");

// Creates a signed JWT containing the user's ID. Expires in 30 days.
// The frontend stores this token and sends it as:
//   Authorization: Bearer <token>
// on every protected request.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
