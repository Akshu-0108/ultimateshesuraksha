require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedCrimeData = require("./utils/seedCrimeData");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Route files
const authRoutes = require("./routes/authRoutes");
const areaRoutes = require("./routes/areaRoutes");
const routeRoutes = require("./routes/routeRoutes");
const sosRoutes = require("./routes/sosRoutes");
const circleRoutes = require("./routes/circleRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const userRoutes = require("./routes/userRoutes");
const savedRouteRoutes = require("./routes/savedRouteRoutes");
const safeHavenRoutes = require("./routes/safeHavenRoutes");

const app = express();

// 2. Middleware
// Allow both the deployed Vercel client and local Vite development to call
// this API. CLIENT_ORIGIN remains available for a future custom domain.
const allowedOrigins = [
  "http://localhost:5173",
  "https://ultimateshesuraksha.vercel.app",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json()); // parses incoming JSON request bodies into req.body

// 3. Health check — useful to confirm the server + deployment are alive
app.get("/", (req, res) => {
  res.status(200).json({ status: "SheSuraksha API is running" });
});

// 4. Mount feature routes
app.use("/api/auth", authRoutes);
app.use("/api/area-audit", areaRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/travel-circle", circleRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/saved-routes", savedRouteRoutes);
app.use("/api/safe-havens", safeHavenRoutes);

// 5. Error handling (must be LAST, after all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Startup sequence: connect to MongoDB Atlas -> load crime CSV into the
// CrimeRecord collection (only runs once; skips if already seeded) ->
// only then start accepting requests. This guarantees the Area Safety
// Audit endpoint never runs a geo query before the data actually exists.
const startServer = async () => {
  await connectDB();
  await seedCrimeData();

  app.listen(PORT, () => {
    console.log(`SheSuraksha API listening on port ${PORT}`);
  });
};

startServer();
