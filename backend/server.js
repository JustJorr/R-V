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

// ===== SCHEMAS =====

// User Schema (Workers, Supervisors, Admins)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["worker", "supervisor", "admin"],
    default: "worker"
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Rating Schema
const ratingSchema = new mongoose.Schema({
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ✅ NEW 11 KPI FIELDS
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

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique index on (ratedBy, ratedUser) to prevent duplicates
ratingSchema.index({ ratedBy: 1, ratedUser: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Rating = mongoose.model("Rating", ratingSchema);

// GET all users (workers)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "worker" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single worker with their ratings
app.get("/api/users/:id", async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select("-password");
    const ratings = await Rating.find({ ratedUser: req.params.id })
      .populate("ratedBy", "name")
      .sort({ createdAt: -1 });
    
    res.json({
      worker,
      ratings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new worker (register)
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

// LOGIN endpoint
app.post("/api/login", async (req, res) => {
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
});

app.post("/api/ratings", async (req, res) => {
  try {
    const fields = [
      "workAreaCompliance",
      "taskCompletion",
      "cleanliness",
      "wasteManagement",
      "organization",
      "uniformCompliance",
      "independence",
      "initiative",
      "teamworkSupport",
      "punctuality",
      "attendance"
    ];

    const existingRating = await Rating.findOne({
      ratedBy: req.body.ratedBy,
      ratedUser: req.body.ratedUser
    });

    let newRating;

    if (existingRating) {
      fields.forEach(f => existingRating[f] = req.body[f]);
      existingRating.comment = req.body.comment;
      newRating = await existingRating.save();
    } else {
      const rating = new Rating({
        ratedBy: req.body.ratedBy,
        ratedUser: req.body.ratedUser,
        ...fields.reduce((acc, f) => {
          acc[f] = req.body[f];
          return acc;
        }, {}),
        comment: req.body.comment
      });

      newRating = await rating.save();
    }

    const allRatings = await Rating.find({ ratedUser: req.body.ratedUser });

    let totalScore = 0;

    allRatings.forEach(r => {
      let sum = 0;
      fields.forEach(f => sum += r[f]);
      totalScore += sum / fields.length;
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

// GET supervisor dashboard data (all workers with latest ratings)
app.get("/api/supervisor/dashboard", async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" })
      .select("_id name email averageRating totalRatings createdAt")
      .sort({ averageRating: -1 });

    const workersWithLatestRating = await Promise.all(
      workers.map(async (worker) => {
        const latestRating = await Rating.findOne({ ratedUser: worker._id })
          .populate("ratedBy", "name")
          .sort({ createdAt: -1 });

        return {
          ...worker._doc,
          latestRating
        };
      })
    );

    res.json(workersWithLatestRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ratings for a specific worker
app.get("/api/ratings/worker/:userId", async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId })
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all ratings made by a specific supervisor (to prevent duplicate ratings)
app.get("/api/supervisor/ratings/:supervisorId", async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedBy: req.params.supervisorId });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific rating for editing (by supervisorId and workerId)
app.get("/api/rating/:supervisorId/:workerId", async (req, res) => {
  try {
    const rating = await Rating.findOne({
      ratedBy: req.params.supervisorId,
      ratedUser: req.params.workerId
    });
    if (!rating) {
      return res.status(404).json({ message: "No rating found" });
    }
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));