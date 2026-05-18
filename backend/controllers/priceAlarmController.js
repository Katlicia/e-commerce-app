const PriceAlarm = require("../models/PriceAlarm");

exports.setPriceAlarm = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(400).json({
        message: "Fiyat alarmı için hesabınıza bir e-posta adresi eklemeniz gerekmektedir.",
      });
    }

    const existing = await PriceAlarm.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: "Bu ürün için zaten fiyat alarmınız var." });
    }

    await PriceAlarm.create({ user: req.user._id, product: productId, email });

    res.status(201).json({ message: "Fiyat alarmı kuruldu." });
  } catch (err) {
    next(err);
  }
};

exports.removePriceAlarm = async (req, res, next) => {
  try {
    await PriceAlarm.findOneAndDelete({ user: req.user._id, product: req.params.productId });
    res.json({ message: "Fiyat alarmı kaldırıldı." });
  } catch (err) {
    next(err);
  }
};

exports.getAlarmStatus = async (req, res, next) => {
  try {
    const alarm = await PriceAlarm.findOne({ user: req.user._id, product: req.params.productId });
    res.json({ hasAlarm: !!alarm });
  } catch (err) {
    next(err);
  }
};

exports.getMyAlarms = async (req, res, next) => {
  try {
    const alarms = await PriceAlarm.find({ user: req.user._id })
      .populate("product", "name images price discountedPrice")
      .sort({ createdAt: -1 });
    res.json(alarms);
  } catch (err) {
    next(err);
  }
};
