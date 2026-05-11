const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminName: { type: String, default: "Sistem" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    detail: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
