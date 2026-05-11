const ActivityLog = require("../models/ActivityLog");

exports.getLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const { entity, action, search } = req.query;

    const filter = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    if (search) {
      filter.$or = [
        { detail: { $regex: search, $options: "i" } },
        { adminName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
