const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const Connection = require("../models/Connection");

// @route   GET /api/users/search?query=name
// @access  Private
// Searches users by name (case-insensitive partial match), excludes the
// current user, and tags each result with the connection status between
// them and the current user — so the frontend can show the right button
// ("Connect" / "Requested" / "Respond" / "Connected").
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || !query.trim()) {
    res.status(400);
    throw new Error("Query param 'query' is required, e.g. /api/users/search?query=Priya");
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    name: new RegExp(query.trim(), "i"),
  })
    .select("name mobileNumber")
    .limit(20);

  if (users.length === 0) {
    return res.status(200).json({ users: [] });
  }

  const userIds = users.map((u) => u._id);
  const connections = await Connection.find({
    $or: [
      { requester: req.user._id, recipient: { $in: userIds } },
      { recipient: req.user._id, requester: { $in: userIds } },
    ],
  });

  // Build a map of otherUserId -> connection status, FROM THE CURRENT USER'S
  // perspective (e.g. "pending_sent" vs "pending_received" depend on who
  // sent the request, not just the raw status field).
  const statusByUserId = {};
  const myId = req.user._id.toString();

  connections.forEach((c) => {
    const otherId = c.requester.toString() === myId ? c.recipient.toString() : c.requester.toString();

    if (c.status === "accepted") {
      statusByUserId[otherId] = "connected";
    } else if (c.status === "pending") {
      statusByUserId[otherId] = c.requester.toString() === myId ? "pending_sent" : "pending_received";
    } else if (c.status === "declined") {
      statusByUserId[otherId] = "declined";
    }
  });

  res.status(200).json({
    users: users.map((u) => ({
      userId: u._id,
      name: u.name,
      mobileNumber: u.mobileNumber,
      connectionStatus: statusByUserId[u._id.toString()] || "none",
    })),
  });
});

module.exports = { searchUsers };
