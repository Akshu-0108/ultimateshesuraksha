const asyncHandler = require("../middleware/asyncHandler");
const Connection = require("../models/Connection");
const User = require("../models/User");
const { sortUserPair } = require("../utils/sortUserPair");

// @route   POST /api/connections/request
// @access  Private
const sendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    res.status(400);
    throw new Error("recipientId is required");
  }

  if (recipientId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You can't send a connection request to yourself");
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    res.status(404);
    throw new Error("User not found");
  }

  const [userLow, userHigh] = sortUserPair(req.user._id, recipientId);
  let connection = await Connection.findOne({ userLow, userHigh });

  if (connection) {
    if (connection.status === "pending") {
      res.status(400);
      throw new Error("A connection request is already pending between you and this user");
    }
    if (connection.status === "accepted") {
      res.status(400);
      throw new Error("You are already connected with this user");
    }
    // status === "declined" -> allow re-sending by reviving the same
    // document (keeps the unique-pair index happy instead of erroring).
    connection.requester = req.user._id;
    connection.recipient = recipientId;
    connection.status = "pending";
    await connection.save();
  } else {
    connection = await Connection.create({
      requester: req.user._id,
      recipient: recipientId,
      userLow,
      userHigh,
      status: "pending",
    });
  }

  res.status(201).json({
    connectionId: connection._id,
    requesterId: connection.requester,
    recipientId: connection.recipient,
    status: connection.status,
    createdAt: connection.createdAt,
  });
});

// @route   PUT /api/connections/:id/accept
// @access  Private
const acceptRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    res.status(404);
    throw new Error("Connection request not found");
  }

  if (connection.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the recipient of this request can accept it");
  }

  if (connection.status !== "pending") {
    res.status(400);
    throw new Error(`This request is already ${connection.status}, not pending`);
  }

  connection.status = "accepted";
  await connection.save();

  res.status(200).json({
    connectionId: connection._id,
    requesterId: connection.requester,
    recipientId: connection.recipient,
    status: connection.status,
    updatedAt: connection.updatedAt,
  });
});

// @route   PUT /api/connections/:id/decline
// @access  Private
const declineRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    res.status(404);
    throw new Error("Connection request not found");
  }

  if (connection.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the recipient of this request can decline it");
  }

  if (connection.status !== "pending") {
    res.status(400);
    throw new Error(`This request is already ${connection.status}, not pending`);
  }

  connection.status = "declined";
  await connection.save();

  res.status(200).json({
    connectionId: connection._id,
    requesterId: connection.requester,
    recipientId: connection.recipient,
    status: connection.status,
    updatedAt: connection.updatedAt,
  });
});

// @route   GET /api/connections
// @access  Private
// "My Circle" — everyone the current user has an ACCEPTED connection with.
const getMyConnections = asyncHandler(async (req, res) => {
  const connections = await Connection.find({
    status: "accepted",
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
  })
    .populate("requester", "name mobileNumber")
    .populate("recipient", "name mobileNumber");

  const myId = req.user._id.toString();

  res.status(200).json({
    connections: connections.map((c) => {
      // Whichever side of the connection ISN'T me is "the other user".
      const other = c.requester._id.toString() === myId ? c.recipient : c.requester;
      return {
        connectionId: c._id,
        userId: other._id,
        name: other.name,
        mobileNumber: other.mobileNumber,
        connectedSince: c.updatedAt,
      };
    }),
  });
});

// @route   GET /api/connections/requests
// @access  Private
// Pending requests sent TO the current user, awaiting accept/decline.
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.find({
    recipient: req.user._id,
    status: "pending",
  }).populate("requester", "name mobileNumber");

  res.status(200).json({
    requests: requests.map((r) => ({
      connectionId: r._id,
      requesterId: r.requester._id,
      requesterName: r.requester.name,
      requesterMobileNumber: r.requester.mobileNumber,
      createdAt: r.createdAt,
    })),
  });
});

module.exports = { sendRequest, acceptRequest, declineRequest, getMyConnections, getPendingRequests };
