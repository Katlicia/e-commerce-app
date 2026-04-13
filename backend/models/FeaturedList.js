const mongoose = require("mongoose");

const featuredListSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeaturedList", featuredListSchema);
