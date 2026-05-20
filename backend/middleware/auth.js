const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.authenticationMiddle = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Giriş yapın." });
  }

  let decodedData;
  try {
    decodedData = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Geçersiz veya süresi bitmiş token." });
  }

  if (!decodedData) {
    return res.status(403).json({ message: "Geçersiz token." });
  }

  try {
    req.user = await User.findById(decodedData.id);
  } catch (err) {
    return res.status(500).json({ message: "Veritabanı hatası." });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Kullanıcı bulunamadı." });
  }
  next();
};

exports.optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  try {
    const decodedData = jwt.verify(token, process.env.JWT_KEY);
    req.user = await User.findById(decodedData.id);
  } catch {
    // as guest
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Permission not granted." });
  }
  next();
};
