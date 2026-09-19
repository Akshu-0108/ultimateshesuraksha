const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  { timestamps: true } // createdAt acts as the alert timestamp
);

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
