const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;