const express = require("express");
const { getDashboard, getSupervisorRatings, getExistingRating } = require("../controllers/supervisorController");

const router = express.Router();

router.get("/supervisor/dashboard", getDashboard);
router.get("/supervisor/ratings/:supervisorId", getSupervisorRatings);
router.get("/rating/:supervisorId/:workerId", getExistingRating);

module.exports = router;
