const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, surname, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "Böyle bir kullanıcı var." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Parola 6 karakterden uzun olmalı." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    surname,
    email,
    password: hashedPassword,
  });

  const token = await generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  res.status(201).cookie("token", token, cookieOptions).json({
    _id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      const token = generateToken(user._id);

      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      res.status(200).cookie("token", token, cookieOptions).json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      });
    } else {
      return res.status(401).json({ message: "Hatalı parola." });
    }
  } else {
    res.status(401).json({ message: "Geçersiz bilgiler." });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Erişim reddedildi. Admin hesabı ile deneyin." });
      }

      const token = generateToken(user._id);

      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      res.status(200).cookie("token", token, cookieOptions).json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      return res.status(401).json({ message: "Hatalı parola." });
    }
  } else {
    res.status(401).json({ message: "Geçersiz bilgiler." });
  }
};

exports.logout = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now()),
  };

  res.status(200).cookie("token", null, cookieOptions).json({
    message: "Çıkış başarılı.",
  });
};

exports.forgetPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  // create password reset token (expires in 5 minutes)
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = new Date(Date.now() + 60 * 5 * 1000);

  // don't validate mongoose schemas this is for password change only
  await user.save({ validateBeforeSave: false });

  const passwordUrl = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  const message = `Password Reset: ${passwordUrl}`;

  // setup mail info and send
  try {
    const transporter = nodemailer.createTransport({
      port: 465,
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
      secure: true,
    });

    const mailData = {
      from: process.env.MAIL,
      to: req.body.email,
      subject: "Password Reset",
      text: message,
    };

    await transporter.sendMail(mailData);

    res.status(200).json({ message: "E-Postanızı kontrol edin." });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({ message: "E-Posta gönderilemedi." });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    surname: req.user.surname,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
};

exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(500).json({
      message: "Geçersiz token.",
    });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      user: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      },
    });
};
