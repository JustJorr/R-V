const mongoose = require("mongoose");

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

module.exports = mongoose.model("Rating", ratingSchema);
