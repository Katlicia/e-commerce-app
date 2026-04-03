const express = require("express");
const { getTaxSettings, updateTaxSettings } = require("../controllers/taxSettingsController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/tax-settings", getTaxSettings);
router.put("/tax-settings", authenticationMiddle, isAdmin, updateTaxSettings);

module.exports = router;
