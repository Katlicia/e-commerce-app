const express = require("express");
const { getAllAdBanners, getBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/banners", authenticationMiddle, isAdmin, getAllAdBanners);
router.get("/banners/:type", getBanner);
router.put("/banners/:type", authenticationMiddle, isAdmin, updateBanner);
router.delete("/banners/:type", authenticationMiddle, isAdmin, deleteBanner);

module.exports = router;
