const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phone, stripeCustomerId, paymentMethodId, setupIntentClientSecret, role } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create a new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    stripeCustomerId,
    paymentMethodId,
    setupIntentClientSecret,
    role: role || 'user',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stripeCustomerId: user.stripeCustomerId,
      paymentMethodId: user.paymentMethodId,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.authUser = async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stripeCustomerId: user.stripeCustomerId,
      paymentMethodId: user.paymentMethodId,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  // Find the user by ID
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      stripeCustomerId: user.stripeCustomerId,
      paymentMethodId: user.paymentMethodId,
      selectedRides: user.selectedRides, // Include the selected rides
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  // Find the user by ID
  const user = await User.findById(req.user.id);

  if (user) {
    // Update user fields if they are provided in the request body
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.stripeCustomerId = req.body.stripeCustomerId || user.stripeCustomerId;
    user.paymentMethodId = req.body.paymentMethodId || user.paymentMethodId;
    user.setupIntentClientSecret = req.body.setupIntentClientSecret || user.setupIntentClientSecret;

    if (req.body.password) {
      user.password = req.body.password; // Make sure this is hashed in your User model using pre-save middleware
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      stripeCustomerId: updatedUser.stripeCustomerId,
      paymentMethodId: updatedUser.paymentMethodId,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
