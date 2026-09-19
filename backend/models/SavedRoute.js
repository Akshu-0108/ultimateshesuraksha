const mongoose = require("mongoose");

// A route is saved against the account that created it, so a user's paths
// remain private and can be restored on another device after signing in.
const savedRouteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    routeId: { type: String, required: true, trim: true },
    routeName: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distanceKm: { type: Number, required: true, min: 0 },
    estimatedTimeMinutes: { type: Number, required: true, min: 0 },
    safetyScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

savedRouteSchema.index({ user: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model("SavedRoute", savedRouteSchema);
