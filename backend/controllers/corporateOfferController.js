const CorporateOffer = require("../models/CorporateOffer");

exports.createOffer = async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
};

exports.getOffers = async (req, res) => {
  try {
    const offers = await CorporateOffer.find()
      .populate("product", "name images")
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOffers = async (req, res) => {
  try {
    const offers = await CorporateOffer.find({ user: req.user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOfferStatus = async (req, res) => {
  try {
    const offer = await CorporateOffer.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
