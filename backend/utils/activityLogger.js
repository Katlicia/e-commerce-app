const ActivityLog = require("../models/ActivityLog");

async function logActivity(req, action, entity, detail) {
  try {
    await ActivityLog.create({
      admin: req.user?._id ?? null,
      adminName: req.user
        ? `${req.user.name} ${req.user.surname}`
        : "Sistem",
      action,
      entity,
      detail,
    });
  } catch (_) {}
}

module.exports = logActivity;
