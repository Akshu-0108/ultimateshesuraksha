const mongoose = require("mongoose");

const travelRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    verifiedOnly: {
      type: Boolean,
      default: false, // if true, this user only wants to match with verified users
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TravelRequest", travelRequestSchema);
