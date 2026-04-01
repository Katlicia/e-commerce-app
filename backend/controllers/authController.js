const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { isAdmin } = require("../middleware/auth");

exports.register = async (req, res) => {
  const { name, surname, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password can't be less than 6 characters" });
  }

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
    token: token,
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
        token: token,
      });
    } else {
      return res.status(401).json({ message: "Incorrect password." });
    }
  } else {
    res.status(401).json({ message: "Invalid credentials." });
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
          .json({ message: "Access denied. Not an admin." });
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
        token: token,
        isAdmin: user.isAdmin,
      });
    } else {
      return res.status(401).json({ message: "Incorrect password." });
    }
  } else {
    res.status(401).json({ message: "Invalid credentials." });
  }
};

exports.logout = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now()),
  };

  res.status(200).cookie("token", null, cookieOptions).json({
    message: "Logout successful",
  });
};

exports.forgetPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = new Date(Date.now() + 60 * 5 * 1000);

  await user.save({ validateBeforeSave: false });

  const passwordUrl = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  const message = `Password Reset: ${passwordUrl}`;

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

    res.status(200).json({ message: "Check your email." });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({ message: "Email could not be sent." });
  }
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
      message: "Invalid token.",
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
      token,
    });
};
