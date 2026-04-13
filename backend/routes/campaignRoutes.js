const express = require("express");
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/campaignController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.post("/campaigns/new", authenticationMiddle, isAdmin, createCampaign);
router.put("/campaigns/:id", authenticationMiddle, isAdmin, updateCampaign);
router.delete("/campaigns/:id", authenticationMiddle, isAdmin, deleteCampaign);

module.exports = router;
