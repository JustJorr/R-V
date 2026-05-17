const express = require("express");
const { getWorkers, getUserById, createUser, login, updateProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/users", getWorkers);
router.get("/users/:id", getUserById);
router.put("/users/:id/profile", updateProfile);
router.post("/users", createUser);
router.post("/login", login);

module.exports = router;
