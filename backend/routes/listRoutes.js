const express = require("express");
const {
  getLists,
  createList,
  deleteList,
  addProductToList,
  removeProductFromList,
} = require("../controllers/listController");
const { authenticationMiddle } = require("../middleware/auth");

const router = express.Router();

router.get("/users/me/lists", authenticationMiddle, getLists);
router.post("/users/me/lists", authenticationMiddle, createList);
router.delete("/users/me/lists/:listId", authenticationMiddle, deleteList);
router.post("/users/me/lists/:listId/products", authenticationMiddle, addProductToList);
router.delete("/users/me/lists/:listId/products/:productId", authenticationMiddle, removeProductFromList);

module.exports = router;