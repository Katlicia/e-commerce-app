const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campaign", campaignSchema);
