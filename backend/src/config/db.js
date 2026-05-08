const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
  console.log("MongoDB connected at", process.env.MONGO_URI);
}

module.exports = { connectDB };
