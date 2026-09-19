const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../middleware/asyncHandler");

// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, mobileNumber, password, emergencyContact } = req.body;

  if (!name || !mobileNumber || !password || !emergencyContact) {
    res.status(400);
    throw new Error(
      "name, mobileNumber, password, and emergencyContact are all required"
    );
  }
  if (
    !emergencyContact.name ||
    !emergencyContact.mobileNumber ||
    !emergencyContact.relationship
  ) {
    res.status(400);
    throw new Error(
      "emergencyContact must include name, mobileNumber, and relationship"
    );
  }

  const existingUser = await User.findOne({ mobileNumber });
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this mobile number already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    mobileNumber,
    password: hashedPassword,
    emergencyContact,
  });

  res.status(201).json({
    userId: user._id,
    name: user.name,
    mobileNumber: user.mobileNumber,
    token: generateToken(user._id),
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { mobileNumber, password } = req.body;

  if (!mobileNumber || !password) {
    res.status(400);
    throw new Error("mobileNumber and password are required");
  }

  const user = await User.findOne({ mobileNumber });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400);
    throw new Error("Invalid mobile number or password");
  }

  res.status(200).json({
    userId: user._id,
    name: user.name,
    mobileNumber: user.mobileNumber,
    token: generateToken(user._id),
  });
});

// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  // req.user was attached by the `protect` middleware
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    userId: user._id,
    name: user.name,
    mobileNumber: user.mobileNumber,
    emergencyContact: user.emergencyContact,
    isVerified: user.isVerified,
  });
});

// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, emergencyContact } = req.body;

  if (name) user.name = name;
  if (emergencyContact) {
    user.emergencyContact = {
      ...user.emergencyContact.toObject(),
      ...emergencyContact,
    };
  }

  const updatedUser = await user.save();

  res.status(200).json({
    userId: updatedUser._id,
    name: updatedUser.name,
    mobileNumber: updatedUser.mobileNumber,
    emergencyContact: updatedUser.emergencyContact,
  });
});

module.exports = { signup, login, getProfile, updateProfile };
