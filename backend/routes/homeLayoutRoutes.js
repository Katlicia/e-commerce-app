const express = require("express");
const { getHomeLayout, updateHomeLayout } = require("../controllers/homeLayoutController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/home-layout", getHomeLayout);
router.put("/home-layout", authenticationMiddle, isAdmin, updateHomeLayout);

module.exports = router;
