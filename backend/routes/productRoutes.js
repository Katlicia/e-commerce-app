const express = require("express");
const {
  getProducts,
  getBrands,
  getProductById,
  getProductByBadge,
  getNewProducts,
  getBestSellers,
  createProduct,
  deleteProduct,
  updateProduct,
  createReview,
  updateReview,
  deleteReview,
  adminProducts,
} = require("../controllers/productController");
const router = express.Router();
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

router.get("/products", getProducts);
router.get("/products/brands", getBrands);
router.get("/products/new-arrivals", getNewProducts);
router.get("/products/best-sellers", getBestSellers);
router.get("/products/badge/:badge", getProductByBadge);
router.get("/admin/products", authenticationMiddle, isAdmin, adminProducts);
router.post("/products/new", authenticationMiddle, isAdmin, createProduct);
router.post("/products/newReview", authenticationMiddle, createReview);
router.put("/products/updateReview", authenticationMiddle, updateReview);
router.delete("/products/deleteReview", authenticationMiddle, deleteReview);
router.get("/products/:id", getProductById);
router.put("/products/:id", authenticationMiddle, isAdmin, updateProduct);
router.delete("/products/:id", authenticationMiddle, isAdmin, deleteProduct);

module.exports = router;