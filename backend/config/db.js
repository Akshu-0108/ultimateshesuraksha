const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the URI stored in .env.
// Called once from server.js when the app starts.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Exit the process if we can't connect to the DB — the app is useless without it.
    process.exit(1);
  }
};

module.exports = connectDB;
