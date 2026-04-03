const mongoose = require("mongoose");

const cargoSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    cargoPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cargo", cargoSchema);
