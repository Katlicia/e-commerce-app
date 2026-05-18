const Banner = require("../models/Banner");
const HomeLayout = require("../models/HomeLayout");
const cloudinary = require("cloudinary").v2;

exports.getAllAdBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ type: /^adbanner-/ }).select("type label");
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Bannerlar alınırken hata oluştu.", error: error.message });
  }
};

exports.getBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findOne({ type: req.params.type });
    res.json(banner || { type: req.params.type, label: "", images: [] });
  } catch (error) {
    res.status(500).json({ message: "Banner alınırken hata oluştu.", error: error.message });
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { label = "", keepImages = [], newImages = [] } = req.body;

    const current = await Banner.findOne({ type });
    if (current) {
      const keepIds = new Set(keepImages.map((img) => img.public_id));
      for (const img of current.images) {
        if (!keepIds.has(img.public_id)) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const uploadedNew = [];
    for (const img of newImages) {
      const result = await cloudinary.uploader.upload(img, { folder: "banners" });
      uploadedNew.push({ public_id: result.public_id, url: result.secure_url, link: "" });
    }

    const images = [...keepImages, ...uploadedNew];
    const banner = await Banner.findOneAndUpdate(
      { type },
      { type, label, images },
      { upsert: true, returnDocument: "after" },
    );

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: "Banner güncellenirken hata oluştu.", error: error.message });
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findOne({ type: req.params.type });
    if (!banner) return res.status(404).json({ message: "Banner bulunamadı." });

    for (const img of banner.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await Banner.deleteOne({ type: req.params.type });

    // Layout'tan bu banner'a referans veren girişleri temizle
    const layout = await HomeLayout.findOne();
    if (layout) {
      layout.sections = layout.sections.filter((s) => s.bannerType !== req.params.type);
      await layout.save();
    }

    res.json({ message: "Banner silindi." });
  } catch (error) {
    res.status(500).json({ message: "Banner silinirken hata oluştu.", error: error.message });
  }
};
