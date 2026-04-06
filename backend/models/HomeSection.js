const mongoose = require("mongoose");

const categoryRowSideSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    filterType: { type: String, enum: ["category", "brand"], default: "category" },
    filterValue: { type: String, default: "" },
    banner: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
  },
  { _id: false },
);

const homeSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    badge: {
      type: String,
      enum: ["yeni", "gunun-firsati", "en-cok-satan", "indirimli", ""],
      default: "",
    },
    showTimer: { type: Boolean, default: false },
    timerStart: { type: Date },
    timerEnd: { type: Date },
    banner: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    left: { type: categoryRowSideSchema, default: null },
    right: { type: categoryRowSideSchema, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HomeSection", homeSectionSchema);
