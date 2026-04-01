const Order = require("../models/Order");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Sipariş öğeleri boş olamaz." });
    }
    if (!address) {
      return res.status(400).json({ message: "Teslimat adresi zorunludur." });
    }

    const orderNo =
      "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 9000 + 1000);

    const order = await Order.create({
      user: req.user._id,
      orderNo,
      items,
      totalAmount,
      address,
    });

    // Clear cart after purchase
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.status(201).json({ success: true, order });
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
