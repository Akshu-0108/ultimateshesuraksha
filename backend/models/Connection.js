const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    // Who sent the request and who received it — needed to know who is
    // allowed to accept/decline, and to show "sent" vs "received" in the UI.
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // userLow/userHigh store the SAME two user IDs as requester/recipient,
    // but always in a fixed (sorted) order regardless of who sent the
    // request. This lets us put a unique index on the pair below, so
    // MongoDB itself guarantees there can only ever be ONE connection
    // document between any two given users — no duplicate/conflicting
    // pending requests in both directions.
    userLow: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userHigh: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true } // createdAt = when requested, updatedAt = when accepted/declined
);

connectionSchema.index({ userLow: 1, userHigh: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);
