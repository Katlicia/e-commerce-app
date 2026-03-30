const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addUserAddresses,
  getUserAddresses,
  getUserDetail,
} = require("../controllers/userController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users", authenticationMiddle, getUsers);
router.get("/users/me", authenticationMiddle, getUserDetail);
router.get("/users/me/addresses", authenticationMiddle, getUserAddresses);
router.post("/users/me/addresses", authenticationMiddle, addUserAddresses);
router.get("/users/:id", getUserById);
router.put("/users/:id", authenticationMiddle, updateUser);
router.delete("/users/:id", authenticationMiddle, deleteUser);

module.exports = router;
