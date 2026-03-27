const express = require("express");
const {
  getProducts,
  getProductById,
  getProductByBadge,
  createProduct,
  deleteProduct,
  updateProduct,
  createReview,
  adminProducts,
} = require("../controllers/productController");
const router = express.Router();
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

router.get("/products", getProducts);
router.get("/products/badge/:badge", getProductByBadge);
router.get("/admin/products", authenticationMiddle, isAdmin, adminProducts);
router.get("/products/:id", getProductById);
router.post("/products/new", authenticationMiddle, isAdmin, createProduct);
router.put("/products/:id", authenticationMiddle, isAdmin, updateProduct);
router.delete("/products/:id", authenticationMiddle, isAdmin, deleteProduct);
router.post("/products/newReview", authenticationMiddle, createReview);

module.exports = router;
