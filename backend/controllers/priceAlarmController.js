const PriceAlarm = require("../models/PriceAlarm");

exports.setPriceAlarm = async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
};

exports.removePriceAlarm = async (req, res) => {
  try {
    await PriceAlarm.findOneAndDelete({ user: req.user._id, product: req.params.productId });
    res.json({ message: "Fiyat alarmı kaldırıldı." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlarmStatus = async (req, res) => {
  try {
    const alarm = await PriceAlarm.findOne({ user: req.user._id, product: req.params.productId });
    res.json({ hasAlarm: !!alarm });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
