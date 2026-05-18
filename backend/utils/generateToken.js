const jwt = require("jsonwebtoken");

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "15m" });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });

module.exports = { generateAccessToken, generateRefreshToken };
