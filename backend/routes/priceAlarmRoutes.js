const express = require("express");
const { setPriceAlarm, removePriceAlarm, getAlarmStatus, getMyAlarms } = require("../controllers/priceAlarmController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/price-alarms/me", authenticationMiddle, getMyAlarms);
router.post("/price-alarms", authenticationMiddle, setPriceAlarm);
router.delete("/price-alarms/:productId", authenticationMiddle, removePriceAlarm);
router.get("/price-alarms/:productId", authenticationMiddle, getAlarmStatus);

module.exports = router;
