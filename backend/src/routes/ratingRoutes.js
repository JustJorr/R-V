const express = require("express");
const { submitRating, getRatingsForWorker, getRatingHistory } = require("../controllers/ratingController");

const router = express.Router();

router.post("/ratings", submitRating);
router.get("/ratings/worker/:userId", getRatingsForWorker);
router.get("/ratings/worker/:workerId/history", getRatingHistory);

module.exports = router;
