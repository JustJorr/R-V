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

function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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
    const currentMonth = getMonthKey();
    const previousMonth = getPreviousMonthKey();
    const allowedMonths = new Set([currentMonth, previousMonth]);
    const targetMonth = req.body.dateKey || currentMonth;

    if (!allowedMonths.has(targetMonth)) {
      return res.status(403).json({ message: "Ratings can only be submitted or edited for this month or last month." });
    }

    const existingRating = await Rating.findOne({
      ratedBy: req.body.ratedBy,
      ratedUser: req.body.ratedUser,
      dateKey: targetMonth
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
        dateKey: targetMonth
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
    const selectedMonth = req.query.month;
    const workers = await User.find({ role: "worker" })
      .select("_id name email role averageRating totalRatings createdAt")
      .lean()
      .sort({ averageRating: -1 });

    const workersWithLatestRating = await Promise.all(
      workers.map(async (worker) => {
        const latestRatingFilter = selectedMonth
          ? { ratedUser: worker._id, dateKey: selectedMonth }
          : { ratedUser: worker._id };

        const latestRating = await Rating.findOne(latestRatingFilter)
          .populate("ratedBy", "name role")
          .lean()
          .sort({ createdAt: -1 });

        let monthAverageRating = null;
        if (selectedMonth) {
          const monthRatings = await Rating.find({
            ratedUser: worker._id,
            dateKey: selectedMonth
          }).lean();

          if (monthRatings.length > 0) {
            const ratingAverages = monthRatings.map((r) => {
              const total = KPI_FIELDS.reduce((sum, field) => sum + (Number(r[field]) || 0), 0);
              return total / KPI_FIELDS.length;
            });
            monthAverageRating =
              ratingAverages.reduce((sum, val) => sum + val, 0) / ratingAverages.length;
          }
        }

        return {
          ...worker,
          latestRating,
          monthAverageRating
        };
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

    if (date) {
      filter.dateKey = date;
    } else if (month) {
      filter.dateKey = month;
    }

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Returns all of a supervisor's ratings for currentMonth only (used to mark rated workers)
app.get("/api/supervisor/ratings/:supervisorId", async (req, res) => {
  try {
    const currentMonth = getMonthKey();
    const previousMonth = getPreviousMonthKey();
    const requestedMonth = req.query.month || currentMonth;
    const allowedMonths = new Set([currentMonth, previousMonth]);
    const month = allowedMonths.has(requestedMonth) ? requestedMonth : currentMonth;
    const ratings = await Rating.find({
      ratedBy: req.params.supervisorId,
      dateKey: month
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get currentMonth's rating by supervisor for a specific worker (for editing)
app.get("/api/rating/:supervisorId/:workerId", async (req, res) => {
  try {
    const currentMonth = getMonthKey();
    const previousMonth = getPreviousMonthKey();
    const requestedMonth = req.query.month || currentMonth;
    const allowedMonths = new Set([currentMonth, previousMonth]);
    const month = allowedMonths.has(requestedMonth) ? requestedMonth : currentMonth;
    const rating = await Rating.findOne({
      ratedBy: req.params.supervisorId,
      ratedUser: req.params.workerId,
      dateKey: month
    });
    if (!rating) return res.status(404).json({ message: `No rating found for ${month}` });
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
    const currentMonth = getMonthKey();

    let filter = {
      ratedUser: req.params.workerId,
      dateKey: { $ne: currentMonth } // exclude currentMonth — history is past only
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

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["worker", "supervisor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    await Rating.deleteMany({
      $or: [
        { ratedUser: req.params.id },
        { ratedBy: req.params.id }
      ]
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/users/:id/password", async (req, res) => {
  try {
    const { password } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { password },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/dashboard", async (req, res) => {
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
});

const XLSX = require("xlsx");
const { FIELD_MAP, REVERSE_MAP } = require("./fieldmap");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

function mapFieldsForExport(data, lang = "en") {
  return data.map(row => {
    const mapped = {};

    Object.keys(row).forEach(key => {
      if (FIELD_MAP[key]) {
        mapped[FIELD_MAP[key][lang]] = row[key];
      } else {
        mapped[key] = row[key];
      }
    });

    return mapped;
  });
}

// EXPORT EXCEL
app.get("/api/admin/export", async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const scope = req.query.scope === "overall" ? "overall" : "month";
    const month = req.query.month || getMonthKey();
    const filter = scope === "overall" ? {} : { dateKey: month };

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name")
      .populate("ratedUser", "name")
      .lean();

    const formatted = ratings.map((r) => {
      const scores = KPI_FIELDS.map((f) => Number(r[f]) || 0);
      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

      return {
        Worker: r.ratedUser?.name || "-",
        Supervisor: r.ratedBy?.name || "-",
        Month: r.dateKey || "-",
        Average: Number(avg.toFixed(2)),
        ...KPI_FIELDS.reduce((acc, f) => {
          acc[f] = r[f];
          return acc;
        }, {})
      };
    });

    const mapped = mapFieldsForExport(formatted, lang);

    const worksheet = XLSX.utils.json_to_sheet(mapped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ratings");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ratings_${scope === "overall" ? "overall" : month}_${lang}.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function mapFieldsForImport(row) {
  const mapped = {};

  Object.keys(row).forEach(key => {
    const normalizedKey = REVERSE_MAP[key] || key;
    mapped[normalizedKey] = row[key];
  });

  return mapped;
}

// IMPORT EXCEL
app.post("/api/admin/import", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const mappedData = jsonData.map(mapFieldsForImport);

    await Rating.insertMany(mappedData);

    res.json({ message: "Import successful", count: mappedData.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
