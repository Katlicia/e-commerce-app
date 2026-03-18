const express = require("express");
const {
  register,
  login,
  logout,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgetPassword", forgetPassword);
router.post("/reset/:token", resetPassword);

module.exports = router;
