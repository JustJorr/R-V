const User = require("../models/User");
const Rating = require("../models/Rating");
const { KPI_FIELDS } = require("../constants/kpiFields");
const { getMonthKey, getPreviousMonthKey, getAllowedMonthsForRole } = require("../utils/dateKeys");

async function submitRating(req, res) {
  try {
    const rater = await User.findById(req.body.ratedBy).select("role");
    if (!rater) return res.status(404).json({ message: "Rater not found" });

    const currentMonth = getMonthKey();
    const previousMonth = getPreviousMonthKey();
    const targetMonth = req.body.dateKey || (rater.role === "worker" ? previousMonth : currentMonth);
    const allowedMonths = getAllowedMonthsForRole(rater.role);

    if (!allowedMonths.has(targetMonth)) {
      const roleMessage = rater.role === "worker"
        ? "Workers can only submit or edit ratings for last month after the month has ended."
        : "Ratings can only be submitted or edited for this month or last month.";
      return res.status(403).json({ message: roleMessage });
    }

    const existingRating = await Rating.findOne({
      ratedBy: req.body.ratedBy,
      ratedUser: req.body.ratedUser,
      dateKey: targetMonth
    });

    let newRating;

    if (existingRating) {
      KPI_FIELDS.forEach((f) => {
        existingRating[f] = req.body[f];
      });
      existingRating.comment = req.body.comment;
      newRating = await existingRating.save();
    } else {
      const rating = new Rating({
        ratedBy: req.body.ratedBy,
        ratedUser: req.body.ratedUser,
        ...KPI_FIELDS.reduce((acc, f) => {
          acc[f] = req.body[f];
          return acc;
        }, {}),
        comment: req.body.comment,
        dateKey: targetMonth
      });
      newRating = await rating.save();
    }

    const allRatings = await Rating.find({ ratedUser: req.body.ratedUser });
    let totalScore = 0;
    allRatings.forEach((r) => {
      let sum = 0;
      KPI_FIELDS.forEach((f) => {
        sum += r[f];
      });
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
}

async function getRatingsForWorker(req, res) {
  try {
    const { date, month } = req.query;
    const filter = { ratedUser: req.params.userId };

    if (date) filter.dateKey = date;
    else if (month) filter.dateKey = month;

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getRatingHistory(req, res) {
  try {
    const { supervisorId } = req.query;
    const currentMonth = getMonthKey();

    const filter = {
      ratedUser: req.params.workerId,
      dateKey: { $ne: currentMonth }
    };

    if (supervisorId) filter.ratedBy = supervisorId;

    const ratings = await Rating.find(filter)
      .populate("ratedBy", "name role")
      .sort({ dateKey: -1 });

    const grouped = {};
    ratings.forEach((r) => {
      if (!grouped[r.dateKey]) grouped[r.dateKey] = [];
      grouped[r.dateKey].push(r);
    });

    const result = Object.entries(grouped).map(([date, entries]) => ({ date, entries }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  submitRating,
  getRatingsForWorker,
  getRatingHistory
};
