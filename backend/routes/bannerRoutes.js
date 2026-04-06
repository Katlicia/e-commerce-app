const express = require("express");
const { getBanner, updateBanner } = require("../controllers/bannerController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/banners/:type", getBanner);
router.put("/banners/:type", authenticationMiddle, isAdmin, updateBanner);

module.exports = router;
