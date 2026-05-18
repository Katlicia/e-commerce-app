const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUsers = async (req, res, next) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
};

exports.getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  }
  res.status(200).json(user);
};

exports.getUserDetail = async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password -isAdmin");
  res.status(200).json(user);
};

exports.updateUser = async (req, res, next) => {
  const isOwner = req.user._id.toString() === req.params.id;
  if (!isOwner && !req.user.isAdmin) {
    return res.status(403).json({ message: "Yetkisiz işlem." });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

  user.name = req.body.name || user.name;
  user.surname = req.body.surname || user.surname;
  if (req.body.email !== undefined) user.email = req.body.email || undefined;
  if (req.body.phone !== undefined) user.phone = req.body.phone || undefined;
  if (req.body.isAdmin !== undefined && req.user.isAdmin) {
    user.isAdmin = req.body.isAdmin;
  }

  await user.save();
  const updatedUser = await User.findById(user._id).select("-password");
  res.status(200).json(updatedUser);
};

exports.deleteUser = async (req, res, next) => {
  const isOwner = req.user._id.toString() === req.params.id;
  if (!isOwner && !req.user.isAdmin) {
    return res.status(403).json({ message: "Yetkisiz işlem." });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

  await user.deleteOne();
  res.status(200).json({ message: "Kullanıcı silindi" });
};

exports.addUserAddresses = async (req, res, next) => {
  try {
    const {
      addressName, fullName, firstName, lastName,
      phone, city, district, address,
      apartment, postalCode,
      invoiceType, companyName, taxOffice, taxNumber,
    } = req.body;
    if (!phone || !city || !district || !address) {
      return res.status(400).json({ message: "Zorunlu adres alanları eksik." });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          addresses: {
            addressName, fullName, firstName, lastName,
            phone, city, district, address,
            apartment, postalCode,
            invoiceType, companyName, taxOffice, taxNumber,
          },
        },
      },
      { returnDocument: "after" },
    );
    res.status(201).json(updated.addresses);
  } catch (err) {
    console.error("addUserAddresses error:", err.message);
    next(err);
  }
};

exports.getUserAddresses = async (req, res, next) => {
  try {
    res.status(200).json(req.user.addresses);
  } catch (err) {
    console.error("getUserAddresses error:", err.message);
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
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
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Şifre güncellendi." });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserAddress = async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= req.user.addresses.length) {
      return res.status(400).json({ message: "Geçersiz adres index." });
    }
    req.user.addresses.splice(index, 1);
    await req.user.save();
    res.status(200).json(req.user.addresses);
  } catch (err) {
    next(err);
  }
};

exports.visitProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const user = req.user;

    user.visitedProducts = [
      productId,
      ...user.visitedProducts
        .map((id) => id.toString())
        .filter((id) => id !== productId),
    ].slice(0, 10);

    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.getVisitedProducts = async (req, res, next) => {
  try {
    const user = await req.user.populate({
      path: "visitedProducts",
      populate: { path: "category", select: "name slug" },
    });
    res.json(user.visitedProducts);
  } catch (err) {
    next(err);
  }
};

exports.updateUserAddress = async (req, res, next) => {
  try {
    const {
      index, addressName, fullName, firstName, lastName,
      phone, city, district, address,
      apartment, postalCode,
      invoiceType, companyName, taxOffice, taxNumber,
    } = req.body;
    if (index === undefined || !phone || !city || !district || !address) {
      return res.status(400).json({ message: "Zorunlu adres alanları eksik." });
    }
    if (index < 0 || index >= req.user.addresses.length) {
      return res.status(400).json({ message: "Geçersiz adres index." });
    }
    req.user.addresses[index] = {
      addressName, fullName, firstName, lastName,
      phone, city, district, address,
      apartment, postalCode,
      invoiceType, companyName, taxOffice, taxNumber,
    };
    await req.user.save();
    res.status(200).json(req.user.addresses);
  } catch (err) {
    next(err);
  }
};
