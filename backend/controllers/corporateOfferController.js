const CorporateOffer = require("../models/CorporateOffer");

exports.createOffer = async (req, res, next) => {
  try {
    const { productId, fullName, email, message } = req.body;

    if (!productId || !fullName?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Ürün, ad soyad ve e-posta alanları zorunludur." });
    }

    await CorporateOffer.create({
      product: productId,
      user: req.user?._id,
      fullName: fullName.trim(),
      email: email.trim(),
      message: message?.trim(),
    });

    res.status(201).json({ message: "Talebiniz alındı." });
  } catch (err) {
    next(err);
  }
};

exports.getOffers = async (req, res, next) => {
  try {
    const offers = await CorporateOffer.find()
      .populate("product", "name images")
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    next(err);
  }
};

exports.getMyOffers = async (req, res, next) => {
  try {
    const offers = await CorporateOffer.find({ user: req.user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    next(err);
  }
};

exports.updateOfferStatus = async (req, res, next) => {
  try {
    const offer = await CorporateOffer.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    ).populate("product", "name images");

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    res.json(offer);
  } catch (err) {
    next(err);
  }
};

exports.replyToOffer = async (req, res, next) => {
  try {
    const { reply } = req.body;

    if (!reply?.trim()) {
      return res.status(400).json({ message: "Yanıt boş olamaz." });
    }

    const offer = await CorporateOffer.findByIdAndUpdate(
      req.params.id,
      { reply: reply.trim(), status: "answered" },
      { new: true },
    ).populate("product", "name images");

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    res.json(offer);
  } catch (err) {
    next(err);
  }
};
