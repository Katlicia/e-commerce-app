const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        addressName: { type: String },
        fullName: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        address: { type: String, required: true },
        apartment: { type: String },
        postalCode: { type: String },
        invoiceType: { type: String, enum: ["bireysel", "kurumsal"], default: "bireysel" },
        companyName: { type: String },
        taxOffice: { type: String },
        taxNumber: { type: String },
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        skuId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        selectedVariants: {
          type: Map,
          of: String,
        },
      },
    ],
    favourites: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    visitedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orderCount: { type: Number, default: 0 },
    cancelCount: { type: Number, default: 0 },
    returnCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
