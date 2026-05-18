const express = require("express");
const {
  createOffer,
  getOffers,
  getMyOffers,
  updateOfferStatus,
} = require("../controllers/corporateOfferController");
const {
  optionalAuth,
  isAdmin,
  authenticationMiddle,
} = require("../middleware/auth");

const router = express.Router();

router.post("/corporate-offers", optionalAuth, createOffer);
router.get("/corporate-offers/me", authenticationMiddle, getMyOffers);
router.get("/corporate-offers", authenticationMiddle, isAdmin, getOffers);
router.patch("/corporate-offers/:id/status", isAdmin, updateOfferStatus);

module.exports = router;
