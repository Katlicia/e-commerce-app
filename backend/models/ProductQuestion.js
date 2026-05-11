const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    answer: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const productQuestionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    question: { type: String, required: true },
    answers: [answerSchema],
    isAnswered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductQuestion", productQuestionSchema);
