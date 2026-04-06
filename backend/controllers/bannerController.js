const Banner = require("../models/Banner");
const cloudinary = require("cloudinary").v2;

exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ type: req.params.type });
    res.json(banner || { type: req.params.type, images: [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Banner alınırken hata oluştu.", error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { type } = req.params;
    const keepImages = req.body.keepImages || [];
    const rawNewImages = req.body.newImages || [];

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
    for (const img of rawNewImages) {
      const result = await cloudinary.uploader.upload(img, {
        folder: "banners",
      });
      uploadedNew.push({
        public_id: result.public_id,
        url: result.secure_url,
        link: "",
      });
    }

    const images = [...keepImages, ...uploadedNew];
    const banner = await Banner.findOneAndUpdate(
      { type },
      { type, images },
      { upsert: true, returnDocument: "after" },
    );

    res.json(banner);
  } catch (error) {
    res.status(500).json({
      message: "Banner güncellenirken hata oluştu.",
      error: error.message,
    });
  }
};
