const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders } = require("../controllers/orderController");
const { authenticationMiddle } = require("../middleware/auth");

router.post("/orders", authenticationMiddle, createOrder);
router.get("/orders/me", authenticationMiddle, getUserOrders);

module.exports = router;
