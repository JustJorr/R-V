const mongoose = require("mongoose");
const app = require("./src/app");
const { connectDB } = require("./src/config/db");

require("dotenv").config();

async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

startServer();
