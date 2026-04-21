const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ===== HELPERS =====

/**
 * Returns today's date as "YYYY-MM-DD" in the server's local timezone.
 * Using toISOString() was causing off-by-one date bugs for timezones
 * that are behind UTC (e.g. UTC-7 at 11 PM shows tomorrow's date in UTC).
 */
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ===== SCHEMAS =====

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["worker", "supervisor", "admin"], default: "worker" },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ratingSchema = new mongoose.Schema({
  ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  workAreaCompliance: { type: Number, min: 0, max: 5, required: true },
  taskCompletion: { type: Number, min: 0, max: 5, required: true },
  cleanliness: { type: Number, min: 0, max: 5, required: true },
  wasteManagement: { type: Number, min: 0, max: 5, required: true },
  organization: { type: Number, min: 0, max: 5, required: true },
  uniformCompliance: { type: Number, min: 0, max: 5, required: true },
  independence: { type: Number, min: 0, max: 5, required: true },
  initiative: { type: Number, min: 0, max: 5, required: true },
  teamworkSupport: { type: Number, min: 0, max: 5, required: true },
  punctuality: { type: Number, min: 0, max: 5, required: true },
  attendance: { type: Number, min: 0, max: 5, required: true },

  comment: String,
  createdAt: { type: Date, default: Date.now },
  dateKey: { type: String, required: true }
});

ratingSchema.index({ ratedBy: 1, ratedUser: 1, dateKey: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Rating = mongoose.model("Rating", ratingSchema);

// ===== KPI FIELDS =====
const KPI_FIELDS = [
  "workAreaCompliance", "taskCompletion", "cleanliness", "wasteManagement",
  "organization", "uniformCompliance", "independence", "initiative",
  "teamworkSupport", "punctuality", "attendance"
];

// ===== ROUTES =====

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "worker" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select("-password");
    const ratings = await Rating.find({ ratedUser: req.params.id })
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });
    res.json({ worker, ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/users", async (req, res) => {
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
});

app.post("/api/login", async (req, res) => {
  try {
    const worker = await User.findOne({ email: req.body.email });
    if (!worker) return res.status(400).json({ message: "User not found" });
    if (worker.password !== req.body.password)
      return res.status(400).json({ message: "Invalid password" });

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
});

app.post("/api/ratings", async (req, res) => {
  try {
    const today = getTodayKey();

    // Prevent rating for any date other than today
    if (req.body.dateKey && req.body.dateKey !== today) {
      return res.status(403).json({ message: "Ratings can only be submitted or edited for today." });
    }

    const existingRating = await Rating.findOne({
      ratedBy: req.body.ratedBy,
      ratedUser: req.body.ratedUser,
      dateKey: today
    });

    let newRating;

    if (existingRating) {
      KPI_FIELDS.forEach(f => existingRating[f] = req.body[f]);
      existingRating.comment = req.body.comment;
      newRating = await existingRating.save();
    } else {
      const rating = new Rating({
        ratedBy: req.body.ratedBy,
        ratedUser: req.body.ratedUser,
        ...KPI_FIELDS.reduce((acc, f) => { acc[f] = req.body[f]; return acc; }, {}),
        comment: req.body.comment,
        dateKey: today
      });
      newRating = await rating.save();
    }

    // Recalculate average
    const allRatings = await Rating.find({ ratedUser: req.body.ratedUser });
    let totalScore = 0;
    allRatings.forEach(r => {
      let sum = 0;
      KPI_FIELDS.forEach(f => sum += r[f]);
      totalScore += sum / KPI_FIELDS.length;
    });
    const avgScore = (totalScore / allRatings.length).toFixed(2);

    await User.findByIdAndUpdate(req.body.ratedUser, {
      averageRating: avgScore,
      totalRatings: allRatings.length
    });

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/supervisor/dashboard", async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" })
      .select("_id name email role averageRating totalRatings createdAt")
      .lean()
      .sort({ averageRating: -1 });

    const workersWithLatestRating = await Promise.all(
      workers.map(async (worker) => {
        const latestRating = await Rating.findOne({ ratedUser: worker._id })
          .populate("ratedBy", "name role")
          .lean()
          .sort({ createdAt: -1 });
        return { ...worker, latestRating };
      })
    );

    res.json(workersWithLatestRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/ratings/worker/:userId", async (req, res) => {
  try {
    const { date, month } = req.query;
    let filter = { ratedUser: req.params.userId };

    if (date) filter.dateKey = date;
    if (month) filter.dateKey = { $regex: `^${month}` };

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Returns all of a supervisor's ratings for TODAY only (used to mark rated workers)
app.get("/api/supervisor/ratings/:supervisorId", async (req, res) => {
  try {
    const today = getTodayKey();
    const ratings = await Rating.find({
      ratedBy: req.params.supervisorId,
      dateKey: today
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's rating by supervisor for a specific worker (for editing)
app.get("/api/rating/:supervisorId/:workerId", async (req, res) => {
  try {
    const today = getTodayKey();
    const rating = await Rating.findOne({
      ratedBy: req.params.supervisorId,
      ratedUser: req.params.workerId,
      dateKey: today
    });
    if (!rating) return res.status(404).json({ message: "No rating found for today" });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * NEW: Get full rating history for a worker, grouped by date.
 */
app.get("/api/ratings/worker/:workerId/history", async (req, res) => {
  try {
    const { supervisorId } = req.query;
    const today = getTodayKey();

    let filter = {
      ratedUser: req.params.workerId,
      dateKey: { $ne: today } // exclude today — history is past only
    };

    if (supervisorId) filter.ratedBy = supervisorId;

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name role")
      .sort({ dateKey: -1 });

    // Group by dateKey
    const grouped = {};
    ratings.forEach(r => {
      if (!grouped[r.dateKey]) grouped[r.dateKey] = [];
      grouped[r.dateKey].push(r);
    });

    const result = Object.entries(grouped).map(([date, entries]) => ({
      date,
      entries
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));