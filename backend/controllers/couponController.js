const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// GET /coupons — list all coupons (admin)
exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

// GET /coupons/active — active coupons (return 2)
exports.getActiveCoupons = async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: new Date() },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  })
    .select(
      "code discountType discountValue minOrderAmount maxDiscount expiryDate",
    )
    .sort({ createdAt: -1 })
    .limit(2);
  res.json(coupons);
};

// POST /coupons/apply — apply coupon, calculate new amount
exports.applyCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase().trim() });

  if (!coupon) return res.status(404).json({ message: "Kupon bulunamadı." });
  if (!coupon.isActive)
    return res.status(400).json({ message: "Bu kupon aktif değil." });
  if (new Date() > coupon.expiryDate)
    return res.status(400).json({ message: "Kuponun süresi dolmuş." });
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ message: "Kupon kullanım limiti dolmuş." });

  const alreadyUsed = await Order.exists({
    user: req.user._id,
    "coupon.couponId": coupon._id,
    status: { $nin: ["İptal Edildi", "İade Edildi"] },
  });
  if (alreadyUsed)
    return res
      .status(400)
      .json({ message: "Bu kuponu daha önce kullandınız." });
  if (orderTotal < coupon.minOrderAmount)
    return res.status(400).json({
      message: `Bu kupon için minimum sipariş tutarı ${coupon.minOrderAmount}₺.`,
    });

  let discount = 0;
  if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  } else {
    discount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  discount = Math.min(discount, orderTotal);

  res.json({
    discount: parseFloat(discount.toFixed(2)),
    couponId: coupon._id,
    code: coupon.code,
  });
};

// POST /coupons/new — create new coupon (admin)
exports.createCoupon = async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    expiryDate,
  } = req.body;
  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    expiryDate,
  });
  res.status(201).json(coupon);
};

// PUT /coupons/:id — update coupon (admin)
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!coupon) return res.status(404).json({ message: "Kupon bulunamadı." });
  res.json(coupon);
};

// DELETE /coupons/:id — delete coupon (admin)
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Kupon bulunamadı." });
  res.json({ message: "Kupon silindi." });
};
