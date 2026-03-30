const User = require("../models/User");

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favourites.product",
    );
    res.status(200).json(user.favourites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToFavourites = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    const existing = user.favourites.find(
      (item) => item.product.toString() === productId,
    );

    if (!existing) {
      user.favourites.push({ product: productId });
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate(
      "favourites.product",
    );
    res.status(200).json(updated.favourites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromFavourites = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.favourites = user.favourites.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();
    const updated = await User.findById(req.user._id).populate(
      "favourites.product",
    );
    res.status(200).json(updated.favourites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearFavourites = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { favourites: [] });
    res.status(200).json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
