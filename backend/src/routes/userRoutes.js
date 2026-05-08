const express = require("express");
const { getWorkers, getUserById, createUser, login } = require("../controllers/userController");

const router = express.Router();

router.get("/users", getWorkers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.post("/login", login);

module.exports = router;
