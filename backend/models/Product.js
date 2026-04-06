const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [{ type: String }],
    brand: {
      type: String,
    },
    badge: {
      type: String,
      enum: ["yeni", "gunun-firsati", "en-cok-satan", "indirimli"],
    },
    descriptionImages: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      min: 1,
      max: 99,
    },
    discountedPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          require: true,
        },
        name: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

productSchema.pre("save", async function () {
  if (!this.code) {
    this.code = Array.from(
      { length: 8 },
      () => CHARS[Math.floor(Math.random() * CHARS.length)],
    ).join("");
  }
  if (this.badge === "indirimli" && this.discountPercent) {
    this.discountedPrice = +(
      this.price *
      (1 - this.discountPercent / 100)
    ).toFixed(2);
  } else {
    this.discountedPrice = undefined;
  }
});

module.exports = mongoose.model("Product", productSchema);
