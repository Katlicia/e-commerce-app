const express = require("express");
const router = express.Router();
const { createPayment, cancelPayment, refundPayment } = require("../controllers/paymentController");
const { optionalAuth, authenticationMiddle } = require("../middleware/auth");

router.post("/api/payment", optionalAuth, createPayment);
router.patch("/api/payment/orders/:id/cancel", authenticationMiddle, cancelPayment);
router.patch("/api/payment/orders/:id/refund", authenticationMiddle, refundPayment);

module.exports = router;
