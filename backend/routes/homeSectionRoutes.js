const express = require("express");
const { getHomeSections, createHomeSection, updateHomeSection, deleteHomeSection } = require("../controllers/homeSectionController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/home-sections", getHomeSections);
router.post("/home-sections", authenticationMiddle, isAdmin, createHomeSection);
router.put("/home-sections/:key", authenticationMiddle, isAdmin, updateHomeSection);
router.delete("/home-sections/:key", authenticationMiddle, isAdmin, deleteHomeSection);

module.exports = router;
