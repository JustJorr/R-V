const User = require("../models/User");
const Rating = require("../models/Rating");

async function getAdminUsers(req, res) {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ name: 1 })
      .collation({ locale: "en", strength: 2 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["worker", "supervisor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    await Rating.deleteMany({
      $or: [{ ratedUser: req.params.id }, { ratedBy: req.params.id }]
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { password } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { password }, { new: true }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAdminDashboard(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const workers = await User.countDocuments({ role: "worker" });
    const supervisors = await User.countDocuments({ role: "supervisor" });
    const admins = await User.countDocuments({ role: "admin" });

    const avgRating = await User.aggregate([
      { $match: { role: "worker" } },
      { $group: { _id: null, avg: { $avg: "$averageRating" } } }
    ]);

    res.json({
      totalUsers,
      workers,
      supervisors,
      admins,
      avgRating: avgRating[0]?.avg || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAdminUsers,
  updateUserRole,
  deleteUser,
  changePassword,
  getAdminDashboard
};
