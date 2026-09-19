const asyncHandler = require("../middleware/asyncHandler");
const TravelRequest = require("../models/TravelRequest");
const Connection = require("../models/Connection");

// @route   POST /api/travel-circle
// @access  Private
const createTravelRequest = asyncHandler(async (req, res) => {
  const { from, to, departureTime, verifiedOnly } = req.body;

  if (!from || !to || !departureTime) {
    res.status(400);
    throw new Error("from, to, and departureTime are required");
  }

  const parsedTime = new Date(departureTime);
  if (isNaN(parsedTime.getTime())) {
    res.status(400);
    throw new Error("departureTime must be a valid ISO date string, e.g. 2026-09-14T18:30:00Z");
  }

  const request = await TravelRequest.create({
    user: req.user._id,
    from: from.trim(),
    to: to.trim(),
    departureTime: parsedTime,
    verifiedOnly: !!verifiedOnly,
  });

  res.status(201).json({
    requestId: request._id,
    userId: request.user,
    from: request.from,
    to: request.to,
    departureTime: request.departureTime,
    verifiedOnly: request.verifiedOnly,
    createdAt: request.createdAt,
  });
});

// @route   GET /api/travel-circle/matches?from=X&to=Y&time=ISO_DATE
// @access  Private
//
// SAFETY MODEL CHANGE: this used to search ALL users' open trip requests
// for a route/time match. It no longer does that — it now ONLY returns
// trips posted by users in the current user's ACCEPTED connections list
// ("My Circle"). A stranger's trip is never visible here, no matter how
// well it matches, until a connection request between the two of you has
// been sent and accepted (see connectionController.js).
//
// from/to/time are now OPTIONAL filters to narrow results WITHIN your
// circle — they no longer control who is allowed to see your trip.
const getMatches = asyncHandler(async (req, res) => {
  const { from, to, time } = req.query;

  // Step 1: who am I accepted-connected with?
  const connections = await Connection.find({
    status: "accepted",
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
  });

  const myId = req.user._id.toString();
  const connectedUserIds = connections.map((c) =>
    c.requester.toString() === myId ? c.recipient : c.requester
  );

  if (connectedUserIds.length === 0) {
    // No connections yet -> no possible matches. Not an error.
    return res.status(200).json({ matches: [] });
  }

  // Step 2: restrict to THOSE users' trips only, then apply optional filters.
  const query = { user: { $in: connectedUserIds } };

  if (from) query.from = new RegExp(`^${from.trim()}$`, "i");
  if (to) query.to = new RegExp(`^${to.trim()}$`, "i");

  if (time) {
    const targetTime = new Date(time);
    if (isNaN(targetTime.getTime())) {
      res.status(400);
      throw new Error("'time' must be a valid ISO date string");
    }
    const windowMs = 2 * 60 * 60 * 1000; // +/- 2 hours
    query.departureTime = {
      $gte: new Date(targetTime.getTime() - windowMs),
      $lte: new Date(targetTime.getTime() + windowMs),
    };
  }

  const matches = await TravelRequest.find(query)
    .populate("user", "name")
    .sort({ departureTime: 1 });

  res.status(200).json({
    matches: matches.map((m) => ({
      requestId: m._id,
      userName: m.user.name,
      from: m.from,
      to: m.to,
      departureTime: m.departureTime,
      verifiedOnly: m.verifiedOnly,
    })),
  });
});

// @route   GET /api/travel-circle/mine
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await TravelRequest.find({ user: req.user._id }).sort({
    departureTime: -1,
  });

  res.status(200).json({
    requests: requests.map((r) => ({
      requestId: r._id,
      from: r.from,
      to: r.to,
      departureTime: r.departureTime,
      verifiedOnly: r.verifiedOnly,
      createdAt: r.createdAt,
    })),
  });
});

module.exports = { createTravelRequest, getMatches, getMyRequests };
