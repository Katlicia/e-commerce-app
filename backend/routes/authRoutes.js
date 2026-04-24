const express = require("express");
const {
  register,
  login,
  adminLogin,
  logout,
  forgetPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/adminlogin", adminLogin);
router.get("/logout", logout);
router.get("/me", authenticationMiddle, getMe);
router.post("/forgetPassword", forgetPassword);
router.post("/reset/:token", resetPassword);

module.exports = router;
