const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders, cancelOrder, returnOrder } = require("../controllers/orderController");
const { authenticationMiddle, optionalAuth } = require("../middleware/auth");

router.post("/orders", optionalAuth, createOrder);
router.get("/orders/me", authenticationMiddle, getUserOrders);
router.patch("/orders/:id/cancel", authenticationMiddle, cancelOrder);
router.patch("/orders/:id/return", authenticationMiddle, returnOrder);

module.exports = router;
