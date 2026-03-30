const express = require("express");
const {
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  clearFavourites,
} = require("../controllers/favouriteController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users/me/favourite", authenticationMiddle, getFavourites);
router.post("/users/me/favourite", authenticationMiddle, addToFavourites);
router.delete(
  "/users/me/favourite/:productId",
  authenticationMiddle,
  removeFromFavourites,
);
router.delete("/users/me/favourite", authenticationMiddle, clearFavourites);

module.exports = router;
