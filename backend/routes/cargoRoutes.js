const express = require("express");
const {
  createCargo,
  getCargos,
  getCargoById,
  updateCargo,
  deleteCargo,
} = require("../controllers/cargoController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/cargo", authenticationMiddle, isAdmin, createCargo);
router.get("/cargo", getCargos);
router.get("/cargo/:id", getCargoById);
router.put("/cargo/:id", authenticationMiddle, isAdmin, updateCargo);
router.delete("/cargo/:id", authenticationMiddle, isAdmin, deleteCargo);

module.exports = router;
