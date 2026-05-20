const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const supervisorRoutes = require("./routes/supervisorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminDataRoutes = require("./routes/adminDataRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", ratingRoutes);
app.use("/api", supervisorRoutes);
app.use("/api", adminRoutes);
app.use("/api", adminDataRoutes);

// Serve React frontend
const buildPath = path.join(__dirname, "../../client/build");
app.use(express.static(buildPath));
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

module.exports = app;