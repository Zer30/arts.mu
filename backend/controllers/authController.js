const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, type, bio, website, location } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    type,
    bio,
    website,
    location
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    type: user.type,
    token
  });
});

// @desc    Authenticate a user
// @route   POST /api/auth/signin
// @access  Public
exports.signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    type: user.type,
    token
  });
});