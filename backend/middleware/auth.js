const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.authenticationMiddle = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(403).json({ message: "You are not logged in." });
  }

  const decodedData = jwt.verify(token, process.env.JWT_KEY);

  if (!decodedData) {
    return res.status(403).json({ message: "Invalid token." });
  }

  req.user = await User.findById(decodedData.id);

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
