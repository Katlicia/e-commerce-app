const express = require("express");
const {
  getCategories,
  getRootCategories,
  getChildren,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/roots", getRootCategories);
router.get("/categories/:slug/children", getChildren);
router.get("/categories/:slug", getCategoryBySlug);
router.post("/categories/new", authenticationMiddle, isAdmin, createCategory);
router.put("/categories/:id", authenticationMiddle, isAdmin, updateCategory);
router.delete("/categories/:id", authenticationMiddle, isAdmin, deleteCategory);

module.exports = router;
