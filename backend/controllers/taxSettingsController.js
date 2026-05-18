const TaxSettings = require("../models/TaxSettings");

exports.getTaxSettings = async (req, res, next) => {
  try {
    let settings = await TaxSettings.findOne();
    if (!settings) {
      settings = await TaxSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ayarlar alınırken hata oluştu.", error: error.message });
  }
};

exports.updateTaxSettings = async (req, res, next) => {
  try {
    let settings = await TaxSettings.findOne();
    if (!settings) {
      settings = await TaxSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ayarlar güncellenirken hata oluştu.", error: error.message });
  }
};
