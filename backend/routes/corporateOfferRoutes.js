const express = require("express");
const {
  createOffer,
  getOffers,
  getMyOffers,
  updateOfferStatus,
  replyToOffer,
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
router.patch("/corporate-offers/:id/status", authenticationMiddle, isAdmin, updateOfferStatus);
router.patch("/corporate-offers/:id/reply", authenticationMiddle, isAdmin, replyToOffer);

module.exports = router;
