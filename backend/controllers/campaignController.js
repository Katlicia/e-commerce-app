const Campaign = require("../models/Campaign");
const cloudinary = require("cloudinary").v2;

exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .populate("coupon", "code discountType discountValue minOrderAmount")
      .populate("products", "name images price discountedPrice")
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
};

exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("coupon", "code discountType discountValue minOrderAmount")
      .populate("products", "name images price discountedPrice");
    if (!campaign)
      return res.status(404).json({ message: "Kampanya bulunamadı." });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

exports.createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      image,
      products,
      startDate,
      endDate,
      coupon,
      isActive,
    } = req.body;

    let uploadedImage = { public_id: "", url: "" };
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "campaigns",
      });
      uploadedImage = { public_id: result.public_id, url: result.secure_url };
    }

    const campaign = await Campaign.create({
      title,
      description,
      image: uploadedImage,
      products: products || [],
      startDate,
      endDate,
      coupon: coupon || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populated = await campaign.populate([
      { path: "coupon", select: "code discountType discountValue" },
      { path: "products", select: "name images price discountedPrice" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      newImage,
      keepImage,
      products,
      startDate,
      endDate,
      coupon,
      isActive,
    } = req.body;

    const current = await Campaign.findById(req.params.id);
    if (!current)
      return res.status(404).json({ message: "Kampanya bulunamadı." });

    let imageData = current.image;
    if (!keepImage) {
      if (current.image?.public_id) {
        await cloudinary.uploader.destroy(current.image.public_id);
      }
      if (newImage) {
        const result = await cloudinary.uploader.upload(newImage, {
          folder: "campaigns",
        });
        imageData = { public_id: result.public_id, url: result.secure_url };
      } else {
        imageData = { public_id: "", url: "" };
      }
    }

    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        image: imageData,
        products: products || [],
        startDate,
        endDate,
        coupon: coupon || null,
        isActive,
      },
      { returnDocument: "after", runValidators: true },
    ).populate([
      { path: "coupon", select: "code discountType discountValue" },
      { path: "products", select: "name images price discountedPrice" },
    ]);

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Kampanya bulunamadı." });

    if (campaign.image?.public_id) {
      await cloudinary.uploader.destroy(campaign.image.public_id);
    }

    res.json({ message: "Kampanya silindi." });
  } catch (err) {
    next(err);
  }
};
