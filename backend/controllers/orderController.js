const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      address,
      billingAddress,
      guestEmail,
      cargoCompany,
      cargoPrice,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Sipariş öğeleri boş olamaz." });
    }
    if (
      !address ||
      !address.fullName ||
      !address.phone ||
      !address.city ||
      !address.district ||
      !address.address
    ) {
      return res
        .status(400)
        .json({ message: "Teslimat adresi eksik veya hatalı." });
    }
    if (!req.user && !guestEmail) {
      return res
        .status(400)
        .json({ message: "Misafir siparişi için mail adresi zorunludur." });
    }
    if (!req.user && guestEmail) {
      const existing = await User.findOne({ email: guestEmail });
      if (existing) {
        return res
          .status(400)
          .json({
            message:
              "Bu mail adresiyle kayıtlı bir hesabınız var. Lütfen giriş yaparak devam edin.",
          });
      }
    }

    let orderNo;
    let exists = true;
    while (exists) {
      orderNo = "#" + Math.floor(100000 + Math.random() * 900000);
      exists = await Order.exists({ orderNo });
    }

    const order = await Order.create({
      ...(req.user ? { user: req.user._id } : { guestEmail }),
      orderNo,
      items,
      totalAmount,
      address,
      cargoCompany,
      cargoPrice,
      ...(billingAddress && { billingAddress }),
    });

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { cart: [] });
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (order.status !== "Hazırlanıyor") {
      return res
        .status(400)
        .json({
          message: "Yalnızca hazırlanmakta olan siparişler iptal edilebilir.",
        });
    }
    order.status = "İptal Edildi";
    await order.save();
    await order.populate("items.product", "name images price discountedPrice");
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (order.status !== "Teslim Edildi") {
      return res
        .status(400)
        .json({
          message: "Yalnızca teslim edilen siparişler iade edilebilir.",
        });
    }
    order.status = "İade Edildi";
    await order.save();
    await order.populate("items.product", "name images price discountedPrice");
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name surname email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    )
      .populate("user", "name surname email")
      .populate("items.product", "name images");
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images price discountedPrice")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
