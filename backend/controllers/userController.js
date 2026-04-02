const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }
  res.status(200).json(user);
};

exports.getUserDetail = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -isAdmin");
  res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.surname = req.body.surname || user.surname;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.status(200).json({ message: "Kullanıcı silindi" });
  } else {
    res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }
};

exports.addUserAddresses = async (req, res) => {
  try {
    const { fullName, phone, city, district, address } = req.body;
    if (!fullName || !phone || !city || !district || !address) {
      return res.status(400).json({ message: "Zorunlu adres alanları eksik." });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: { fullName, phone, city, district, address } } },
      { new: true },
    );
    res.status(201).json(updated.addresses);
  } catch (err) {
    console.error("addUserAddresses error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    res.status(200).json(req.user.addresses);
  } catch (err) {
    console.error("getUserAddresses error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut ve yeni şifre gerekli." });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mevcut şifre hatalı." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Şifre güncellendi." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserAddress = async (req, res) => {
  try {
    const { index, fullName, phone, city, district, address, billingAddress } = req.body;
    if (index === undefined || !fullName || !phone || !city || !district || !address) {
      return res.status(400).json({ message: "Zorunlu adres alanları eksik." });
    }
    if (index < 0 || index >= req.user.addresses.length) {
      return res.status(400).json({ message: "Geçersiz adres index." });
    }
    req.user.addresses[index] = { fullName, phone, city, district, address, billingAddress };
    await req.user.save();
    res.status(200).json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
