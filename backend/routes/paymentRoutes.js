const express = require("express");
const router = express.Router();
const { createPayment } = require("../controllers/paymentController");
const { optionalAuth } = require("../middleware/auth");

router.post("/api/payment", optionalAuth, createPayment);

module.exports = router;
