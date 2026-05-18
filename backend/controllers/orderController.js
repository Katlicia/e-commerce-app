const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const logActivity = require("../utils/activityLogger");

exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      totalAmount,
      address,
      billingAddress,
      guestEmail,
      cargoCompany,
      cargoPrice,
      coupon,
      paymentMethod,
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
      ...(paymentMethod && { paymentMethod }),
      ...(billingAddress && { billingAddress }),
      ...(coupon?.couponId && { coupon }),
    });

    if (coupon?.couponId) {
      await Coupon.findByIdAndUpdate(coupon.couponId, { $inc: { usedCount: 1 } });
    }

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        cart: [],
        $inc: { orderCount: 1 },
      });
    }

    for (const item of items) {
      if (item.skuId) {
        await Product.findOneAndUpdate(
          { _id: item.product, "skus._id": item.skuId },
          { $inc: { "skus.$.stock": -item.quantity, soldCount: item.quantity } },
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
      }
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
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
    await User.findByIdAndUpdate(req.user._id, { $inc: { cancelCount: 1 } });
    for (const item of order.items) {
      if (item.skuId) {
        await Product.findOneAndUpdate(
          { _id: item.product, "skus._id": item.skuId },
          { $inc: { "skus.$.stock": item.quantity, soldCount: -item.quantity } },
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }
    }
    await order.populate("items.product", "name images price discountedPrice stock skus hasVariants");
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

exports.returnOrder = async (req, res, next) => {
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
    await User.findByIdAndUpdate(req.user._id, { $inc: { returnCount: 1 } });
    for (const item of order.items) {
      if (item.skuId) {
        await Product.findOneAndUpdate(
          { _id: item.product, "skus._id": item.skuId },
          { $inc: { "skus.$.stock": item.quantity, soldCount: -item.quantity } },
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity, returnCount: item.quantity },
        });
      }
    }
    await order.populate("items.product", "name images price discountedPrice stock skus hasVariants");
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name surname email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const prev = await Order.findById(req.params.id).select("status");
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    )
      .populate("user", "name surname email")
      .populate("items.product", "name images");
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    logActivity(req, "Durum Güncellendi", "Sipariş", `${prev?.status} → ${status}`).catch(() => {});
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images price discountedPrice discountPercent stock skus hasVariants")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};
