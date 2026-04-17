const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "featured-shortcuts",
      "product-list",
      "ad-banners",
      "category-row",
      "ad-bar",
      "deal-of-day",
    ],
    required: true,
  },
  visible: { type: Boolean, default: true },
  sectionKey: { type: String, default: "" },
  bannerType: { type: String, default: "" },
});

const homeLayoutSchema = new mongoose.Schema(
  {
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HomeLayout", homeLayoutSchema);
