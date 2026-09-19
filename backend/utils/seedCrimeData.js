const fs = require("fs");
const path = require("path");
const CrimeRecord = require("../models/CrimeRecord");

/**
 * Parses delhi_crime_data.csv into an array of row objects.
 *
 * This is a plain manual parser (just `.split(",")`), not a general-purpose
 * CSV library — verified against this specific file, which has exactly 6
 * plain comma-separated columns per row and no quoted fields. If you later
 * load a CSV that has commas INSIDE fields (e.g. a Description with a
 * comma), switch to a proper library like `csv-parse` instead of this.
 */
function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  const lines = raw.split("\n");
  const header = lines[0].split(",").map((h) => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // skip blank lines
    const cols = lines[i].split(",");
    if (cols.length !== header.length) continue; // skip malformed rows

    const row = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx].trim();
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Loads delhi_crime_data.csv into the CrimeRecord collection, but only if
 * that collection is currently empty. Safe to call on every server start —
 * it won't create duplicates on restart.
 */
async function seedCrimeData() {
  const existingCount = await CrimeRecord.countDocuments();
  if (existingCount > 0) {
    console.log(`Crime data already seeded (${existingCount} records) — skipping.`);
    return;
  }

  const csvPath = path.join(__dirname, "..", "delhi_crime_data.csv");
  if (!fs.existsSync(csvPath)) {
    console.warn(
      `delhi_crime_data.csv not found at ${csvPath} — Area Safety Audit will use fallback (safetyScore=100 for every locality) until it's added.`
    );
    return;
  }

  const rows = parseCsv(csvPath);

  const docs = rows
    .map((r) => {
      const lat = parseFloat(r.Latitude);
      const lng = parseFloat(r.Longitude);
      const severity = parseInt(r.Severity, 10);

      if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(severity)) {
        return null; // skip rows with unparseable numbers
      }

      return {
        crimeType: r.Crime_Type,
        crime: r.Crime,
        severity,
        description: r.Description || "",
        location: { type: "Point", coordinates: [lng, lat] },
      };
    })
    .filter(Boolean);

  await CrimeRecord.insertMany(docs);
  console.log(`Seeded ${docs.length} crime records into MongoDB from delhi_crime_data.csv.`);
}

module.exports = seedCrimeData;
