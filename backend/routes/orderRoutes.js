const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders, cancelOrder, returnOrder, adminGetOrders, adminUpdateOrderStatus } = require("../controllers/orderController");
const { authenticationMiddle, optionalAuth, isAdmin } = require("../middleware/auth");

router.post("/orders", optionalAuth, createOrder);
router.get("/orders/me", authenticationMiddle, getUserOrders);
router.patch("/orders/:id/cancel", authenticationMiddle, cancelOrder);
router.patch("/orders/:id/return", authenticationMiddle, returnOrder);
router.get("/admin/orders", authenticationMiddle, isAdmin, adminGetOrders);
router.put("/admin/orders/:id/status", authenticationMiddle, isAdmin, adminUpdateOrderStatus);

module.exports = router;
