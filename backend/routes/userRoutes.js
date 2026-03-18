const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDetail,
} = require("../controllers/userController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/me", authenticationMiddle, getUserDetail);

module.exports = router;
