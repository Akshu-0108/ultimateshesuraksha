const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true, // no two users can sign up with the same mobile number
      trim: true,
    },
    password: {
      type: String,
      required: true, // stored as a bcrypt hash, never plain text
    },
    emergencyContact: {
      name: { type: String, required: true },
      mobileNumber: { type: String, required: true },
      relationship: { type: String, required: true }, // e.g. "Mother", "Friend", "Spouse"
    },
    isVerified: {
      type: Boolean,
      default: false, // used later by Peer Travel Circles "verified-only" filter
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
