const express = require("express");
const { getLogs } = require("../controllers/activityLogController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/logs", authenticationMiddle, isAdmin, getLogs);

module.exports = router;
