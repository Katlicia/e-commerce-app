const FeaturedList = require("../models/FeaturedList");

exports.getFeaturedList = async (req, res) => {
  try {
    const list = await FeaturedList.findOne({ key: req.params.key }).populate(
      "products",
    );
    res.json(list || { key: req.params.key, products: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeaturedList = async (req, res) => {
  try {
    const { key } = req.params;
    const { products } = req.body;

    const list = await FeaturedList.findOneAndUpdate(
      { key },
      { products },
      { upsert: true, returnDocument: "after", new: true },
    ).populate("products");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
