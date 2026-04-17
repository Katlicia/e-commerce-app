const express = require("express");
const router = express.Router();
const { createPayment, cancelPayment, refundPayment, adminCancelPayment, adminRefundPayment } = require("../controllers/paymentController");
const { optionalAuth, authenticationMiddle, isAdmin } = require("../middleware/auth");

router.post("/api/payment", optionalAuth, createPayment);
router.patch("/api/payment/orders/:id/cancel", authenticationMiddle, cancelPayment);
router.patch("/api/payment/orders/:id/refund", authenticationMiddle, refundPayment);
router.patch("/api/payment/admin/orders/:id/cancel", authenticationMiddle, isAdmin, adminCancelPayment);
router.patch("/api/payment/admin/orders/:id/refund", authenticationMiddle, isAdmin, adminRefundPayment);

module.exports = router;
