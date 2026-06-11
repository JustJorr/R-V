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

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", userRoutes);
app.use("/api", ratingRoutes);
app.use("/api", supervisorRoutes);
app.use("/api", adminRoutes);
app.use("/api", adminDataRoutes);

// Serve React frontend
const buildPath = path.resolve(__dirname, "../../client/build");

app.use(express.static(buildPath));

// Express 5 catch-all
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

console.log("Build path:", buildPath);
console.log("Build exists:", require("fs").existsSync(buildPath));

module.exports = app;
