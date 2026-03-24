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

// User Schema (Workers, Managers, Admins)
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
    enum: ["user", "manager", "admin"],
    default: "user"
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
  technicalSkills: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  communication: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  teamwork: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  indexes: [
    { fields: { ratedBy: 1, ratedUser: 1 }, unique: true }
  ]
});

// Create unique index on (ratedBy, ratedUser) to prevent duplicates
ratingSchema.index({ ratedBy: 1, ratedUser: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Rating = mongoose.model("Rating", ratingSchema);

// GET all users (workers)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single user with their ratings
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const ratings = await Rating.find({ ratedUser: req.params.id })
      .populate("ratedBy", "name")
      .sort({ createdAt: -1 });
    
    res.json({
      user,
      ratings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new user (register)
app.post("/api/users", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || "user"
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN endpoint
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    if (user.password !== req.body.password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      averageRating: user.averageRating
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new rating (or update if already exists)
app.post("/api/ratings", async (req, res) => {
  try {
    // Check if manager has already rated this worker
    const existingRating = await Rating.findOne({
      ratedBy: req.body.ratedBy,
      ratedUser: req.body.ratedUser
    });

    let newRating;
    if (existingRating) {
      // Update existing rating
      existingRating.technicalSkills = req.body.technicalSkills;
      existingRating.communication = req.body.communication;
      existingRating.teamwork = req.body.teamwork;
      existingRating.comment = req.body.comment;
      newRating = await existingRating.save();
    } else {
      // Create new rating
      const rating = new Rating({
        ratedBy: req.body.ratedBy,
        ratedUser: req.body.ratedUser,
        technicalSkills: req.body.technicalSkills,
        communication: req.body.communication,
        teamwork: req.body.teamwork,
        comment: req.body.comment
      });
      newRating = await rating.save();
    }
    
    // Update user's average rating across all ratings
    const allRatings = await Rating.find({ ratedUser: req.body.ratedUser });
    
    // Calculate average of all 3 fields
    let totalScore = 0;
    allRatings.forEach(r => {
      const ratingAvg = (r.technicalSkills + r.communication + r.teamwork) / 3;
      totalScore += ratingAvg;
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

// GET manager dashboard data (all workers with latest ratings)
app.get("/api/manager/dashboard", async (req, res) => {
  try {
    const workers = await User.find({ role: "user" })
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

// GET ratings for a specific user
app.get("/api/ratings/user/:userId", async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId })
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all ratings made by a specific manager (to prevent duplicate ratings)
app.get("/api/manager/ratings/:managerId", async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedBy: req.params.managerId });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific rating for editing (by managerId and workerId)
app.get("/api/rating/:managerId/:workerId", async (req, res) => {
  try {
    const rating = await Rating.findOne({
      ratedBy: req.params.managerId,
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