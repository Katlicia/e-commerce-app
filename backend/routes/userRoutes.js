const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addUserAddresses,
  getUserAddresses,
  updateUserAddress,
  getUserDetail,
  changePassword,
} = require("../controllers/userController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users", authenticationMiddle, getUsers);
router.get("/users/me", authenticationMiddle, getUserDetail);
router.get("/users/me/addresses", authenticationMiddle, getUserAddresses);
router.post("/users/me/addresses", authenticationMiddle, addUserAddresses);
router.put("/users/me/addresses", authenticationMiddle, updateUserAddress);
router.put("/users/me/password", authenticationMiddle, changePassword);
router.get("/users/:id", getUserById);
router.put("/users/:id", authenticationMiddle, updateUser);
router.delete("/users/:id", authenticationMiddle, deleteUser);

module.exports = router;
