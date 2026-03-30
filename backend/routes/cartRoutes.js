const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users/me/cart", authenticationMiddle, getCart);
router.post("/users/me/cart", authenticationMiddle, addToCart);
router.put("/users/me/cart/:productId", authenticationMiddle, updateCartItem);
router.delete("/users/me/cart/:productId", authenticationMiddle, removeFromCart);
router.delete("/users/me/cart", authenticationMiddle, clearCart);

module.exports = router;
