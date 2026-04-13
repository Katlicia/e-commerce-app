const express = require("express");
const {
  getFeaturedList,
  updateFeaturedList,
} = require("../controllers/featuredListController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/featured-lists/:key", getFeaturedList);
router.put(
  "/featured-lists/:key",
  authenticationMiddle,
  isAdmin,
  updateFeaturedList,
);

module.exports = router;
