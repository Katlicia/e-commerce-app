const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.authenticationMiddle = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(403).json({ message: "You are not logged in." });
  }

  let decodedData;
  try {
    decodedData = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  if (!decodedData) {
    return res.status(403).json({ message: "Invalid token." });
  }

  try {
    req.user = await User.findById(decodedData.id);
  } catch (err) {
    return res.status(500).json({ message: "Database error." });
  }

  if (!req.user) {
    return res.status(401).json({ message: "User not found." });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Permission not granted." });
  }
  next();
};
