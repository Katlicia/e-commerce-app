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
        skuId: { type: mongoose.Schema.Types.ObjectId },
        selectedVariants: {
          type: Map,
          of: String,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
      code: { type: String },
      discount: { type: Number },
    },
    cargoCompany: {
      type: String,
      required: true,
    },
    cargoPrice: {
      type: Number,
      required: true,
    },
    address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      address: { type: String, required: true },
    },
    billingAddress: {
      fullName: { type: String },
      phone: { type: String },
      city: { type: String },
      district: { type: String },
      address: { type: String },
    },
    paymentId: { type: String },
    conversationId: { type: String },
    paymentTransactionId: { type: String },
    status: {
      type: String,
      enum: ["Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi", "İptal Edildi", "İade Edildi"],
      default: "Hazırlanıyor",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
