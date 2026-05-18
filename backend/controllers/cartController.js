const User = require("../models/User");

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product", "name images price discountedPrice discountPercent stock hasVariants skus");
    res.status(200).json(user.cart);
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, skuId, selectedVariants } = req.body;
    const user = await User.findById(req.user._id);

    const existing = user.cart.find((item) => {
      if (item.product.toString() !== productId) return false;
      if (skuId) return item.skuId?.toString() === skuId;
      return !item.skuId;
    });

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity, skuId, selectedVariants });
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate("cart.product", "name images price discountedPrice discountPercent stock hasVariants skus");
    res.status(200).json(updated.cart);
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, skuId } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.cart.find((i) => {
      if (i.product.toString() !== productId) return false;
      if (skuId) return i.skuId?.toString() === skuId;
      return !i.skuId;
    });

    if (!item) {
      return res.status(404).json({ message: "Ürün sepette bulunamadı." });
    }

    item.quantity = quantity;
    await user.save();
    const updated = await User.findById(req.user._id).populate("cart.product", "name images price discountedPrice discountPercent stock hasVariants skus");
    res.status(200).json(updated.cart);
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { skuId } = req.body;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter((item) => {
      if (item.product.toString() !== productId) return true;
      if (skuId) return item.skuId?.toString() !== skuId;
      return !!item.skuId;
    });

    await user.save();
    const updated = await User.findById(req.user._id).populate("cart.product", "name images price discountedPrice discountPercent stock hasVariants skus");
    res.status(200).json(updated.cart);
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.status(200).json([]);
  } catch (err) {
    next(err);
  }
};
