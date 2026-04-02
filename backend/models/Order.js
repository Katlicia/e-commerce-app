const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestEmail: {
      type: String,
    },
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi", "İptal Edildi"],
      default: "Hazırlanıyor",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
