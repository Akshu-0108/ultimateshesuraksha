const mongoose = require("mongoose");

const crimeRecordSchema = new mongoose.Schema({
  crimeType: {
    type: String,
    required: true, // e.g. "Theft", "Assault", "Robbery" (from CSV's Crime_Type column)
  },
  crime: {
    type: String,
    required: true, // more specific label, e.g. "Pickpocketing" (from CSV's Crime column)
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    default: "",
  },
  // GeoJSON Point — MongoDB's format for geospatial queries.
  // IMPORTANT: coordinates are stored as [longitude, latitude], NOT [lat, lng].
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

// Lets MongoDB efficiently answer "find records near this point / within
// this radius" queries. Required for the $near query used in
// safetyDataEngine.js.
crimeRecordSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("CrimeRecord", crimeRecordSchema);
