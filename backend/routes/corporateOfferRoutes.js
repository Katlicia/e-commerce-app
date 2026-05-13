const express = require("express");
const {
  createOffer,
  getOffers,
  updateOfferStatus,
} = require("../controllers/corporateOfferController");
const { optionalAuth, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/corporate-offers", optionalAuth, createOffer);
router.get("/corporate-offers", isAdmin, getOffers);
router.patch("/corporate-offers/:id/status", isAdmin, updateOfferStatus);

module.exports = router;
