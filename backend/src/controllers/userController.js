const User = require("../models/User");
const Rating = require("../models/Rating");

async function getWorkers(req, res) {
  try {
    const users = await User.find({ role: "worker" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const worker = await User.findById(req.params.id).select("-password");
    const ratings = await Rating.find({ ratedUser: req.params.id })
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });
    res.json({ worker, ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createUser(req, res) {
  const worker = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || "worker"
  });

  try {
    const newUser = await worker.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const worker = await User.findOne({ email: req.body.email });
    if (!worker) return res.status(400).json({ message: "User not found" });
    if (worker.password !== req.body.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role,
      averageRating: worker.averageRating
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getWorkers,
  getUserById,
  createUser,
  login
};
