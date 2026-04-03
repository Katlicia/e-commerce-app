const mongoose = require("mongoose");

const taxSettingsSchema = new mongoose.Schema({
  freeShippingThreshold: { type: Number, required: true, default: 500 },
  kdv1Rate: { type: Number, required: true, default: 0.01 },
  kdv20Rate: { type: Number, required: true, default: 0.2 },
});

module.exports = mongoose.model("TaxSettings", taxSettingsSchema);
