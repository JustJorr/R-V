const express = require("express");
const {
  getAdminUsers,
  updateUserRole,
  deleteUser,
  changePassword,
  getAdminDashboard,
  getPendingRatingEditRequests,
  reviewRatingEditRequest
} = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/users", getAdminUsers);
router.put("/admin/users/:id/role", updateUserRole);
router.delete("/admin/users/:id", deleteUser);
router.put("/admin/users/:id/password", changePassword);
router.get("/admin/dashboard", getAdminDashboard);
router.get("/admin/rating-edit-requests", getPendingRatingEditRequests);
router.put("/admin/rating-edit-requests/:ratingId", reviewRatingEditRequest);

module.exports = router;
