const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const accessCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: new Date(Date.now() + 15 * 60 * 1000),
});

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

exports.register = async (req, res, next) => {
  try {
    const { name, surname, email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email veya telefon numarası zorunludur." });
    }

    const existingUser = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Böyle bir kullanıcı var." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Parola 6 karakterden uzun olmalı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      surname,
      ...(email && { email }),
      ...(phone && { phone }),
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .status(201)
      .cookie("token", accessToken, accessCookieOptions())
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        token: accessToken,
        refreshToken,
      });
  } catch (err) {
    next(err);
  }
};

exports.checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Telefon numarası gerekli." });
    const user = await User.findOne({ phone });
    return user
      ? res.status(200).json({ exists: true })
      : res.status(404).json({ exists: false });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email veya telefon numarası gerekli." });
    }

    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    const user = await User.findOne({ $or: conditions });
    const validPassword = user && (await bcrypt.compare(password, user.password));
    if (!user || !validPassword) {
      return res.status(401).json({ message: "Geçersiz bilgiler." });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .status(200)
      .cookie("token", accessToken, accessCookieOptions())
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        token: accessToken,
        refreshToken,
      });
  } catch (err) {
    next(err);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email veya telefon numarası gerekli." });
    }

    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    const user = await User.findOne({ $or: conditions });
    if (!user) return res.status(401).json({ message: "Geçersiz bilgiler." });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Hatalı parola." });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Erişim reddedildi. Admin hesabı ile deneyin." });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .status(200)
      .cookie("token", accessToken, accessCookieOptions())
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin,
        token: accessToken,
        refreshToken,
      });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  const expired = { httpOnly: true, expires: new Date(0) };
  res
    .status(200)
    .cookie("token", null, expired)
    .cookie("refreshToken", null, expired)
    .json({ message: "Çıkış başarılı." });
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token bulunamadı." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_KEY);
    } catch {
      return res.status(401).json({ message: "Geçersiz veya süresi bitmiş refresh token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Kullanıcı bulunamadı." });

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res
      .status(200)
      .cookie("token", accessToken, accessCookieOptions())
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions())
      .json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ message: "E-Postanızı kontrol edin." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 60 * 5 * 1000);
    await user.save({ validateBeforeSave: false });

    const passwordUrl = `${process.env.CLIENT_URL}/reset/${resetToken}`;

    try {
      const transporter = nodemailer.createTransport({
        port: 465,
        service: "gmail",
        host: "smtp.gmail.com",
        auth: { user: process.env.MAIL, pass: process.env.PASS },
        secure: true,
      });
      await transporter.sendMail({
        from: process.env.MAIL,
        to: req.body.email,
        subject: "Password Reset",
        text: `Password Reset: ${passwordUrl}`,
      });
      res.status(200).json({ message: "E-Postanızı kontrol edin." });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: "E-Posta gönderilemedi." });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    surname: req.user.surname,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Geçersiz token." });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .status(200)
      .cookie("token", accessToken, accessCookieOptions())
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .json({
        token: accessToken,
        refreshToken,
        user: { _id: user._id, name: user.name, surname: user.surname, email: user.email },
      });
  } catch (err) {
    next(err);
  }
};
