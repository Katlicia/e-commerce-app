const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        link: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
