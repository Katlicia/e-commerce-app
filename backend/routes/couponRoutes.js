const express = require("express");
const {
  getCoupons,
  getActiveCoupons,
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/coupons", authenticationMiddle, isAdmin, getCoupons);
router.get("/coupons/active", getActiveCoupons);
router.post("/coupons/apply", authenticationMiddle, applyCoupon);
router.post("/coupons/new", authenticationMiddle, isAdmin, createCoupon);
router.put("/coupons/:id", authenticationMiddle, isAdmin, updateCoupon);
router.delete("/coupons/:id", authenticationMiddle, isAdmin, deleteCoupon);

module.exports = router;
