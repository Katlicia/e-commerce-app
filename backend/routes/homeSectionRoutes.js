const express = require("express");
const { getHomeSections, updateHomeSection } = require("../controllers/homeSectionController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/home-sections", getHomeSections);
router.put("/home-sections/:key", authenticationMiddle, isAdmin, updateHomeSection);

module.exports = router;
