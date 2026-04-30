const express = require("express");
const {
  getAllListedProducts,
  getListedProductsById,
  createListedProducts,
  updateListedProducts,
  deleteListedProducts,
} = require("../controllers/listedProductsController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/listed-products", getAllListedProducts);
router.get("/listed-products/:id", getListedProductsById);
router.post("/listed-products", authenticationMiddle, isAdmin, createListedProducts);
router.put("/listed-products/:id", authenticationMiddle, isAdmin, updateListedProducts);
router.delete("/listed-products/:id", authenticationMiddle, isAdmin, deleteListedProducts);

module.exports = router;