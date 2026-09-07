const { User, AuditLog } = require("../models/schemas");
const { AppError } = require("../utils/async");

async function listUsers(req, res) {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    const rx = new RegExp(q, "i");
    filter.$or = [{ email: rx }, { full_name: rx }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  res.json({
    users: users.map((u) => ({
      id: u._id,
      email: u.email,
      role: u.role,
      full_name: u.full_name,
      is_active: u.is_active,
      created_at: u.createdAt,
    })),
  });
}

async function setUserActive(req, res) {
  const { active } = req.body;
  if (typeof active !== "boolean") throw new AppError("active is required", 400);
  const user = await User.findByIdAndUpdate(req.params.id, { is_active: active }, { new: true });
  if (!user) throw new AppError("User not found", 404);
  res.json({ ok: true });
}

async function listAuditLogs(_req, res) {
  const logs = await AuditLog.find()
    .populate("user_id", "email")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({
    logs: logs.map((l) => ({
      id: l._id,
      user_id: l.user_id,
      email: l.user_id?.email,
      action: l.action,
      entity: l.entity,
      entity_id: l.entity_id,
      ip: l.ip,
      created_at: l.createdAt,
    })),
  });
}

module.exports = { listUsers, setUserActive, listAuditLogs };