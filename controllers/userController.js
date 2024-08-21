const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Stripe = require('stripe');
const { encrypt, decrypt } = require('../utils/encryption');
const nodemailer = require('nodemailer');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
// Function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = encrypt(password);
  
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
  
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  };
  

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
authUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (user && decrypt(user.password) === password) {
        res.json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error authenticating user', error });
    }
  };
  

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
  
      if (user) {
        res.json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile', error });
    }
  };
  

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
updateUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
  
      if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
  
        if (req.body.password) {
          user.password = encrypt(req.body.password);
        }
  
        const updatedUser = await user.save();
  
        res.json({
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile', error });
    }
  };
  

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  };
  


changePassword = async (req, res) => {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
  
    if (!firstName || !lastName || !email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const user = await User.findOne({ email, firstName, lastName });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const decryptedPassword = decrypt(user.password);
  
      if (currentPassword !== decryptedPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      user.password = encrypt(newPassword);
      await user.save();
  
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error changing password', error });
    }
  };
  

createCheckoutSession = async (req, res) => {
    const { customerId } = req.body;
  
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
  
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        customer: customerId,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      });
  
      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Error creating checkout session' });
    }
  };

  

createCustomer = async (req, res) => {
    const { email, name } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
  
      res.json({ stripeCustomerId: customer.id });
    } catch (error) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: 'Error creating customer.' });
    }
  };

  
  createPaymentIntent = async (req, res) => {
    const { amount, stripeCustomerId, paymentMethodId, customerName, customerAddress } = req.body;
  
    if (!amount || !stripeCustomerId || !paymentMethodId || !customerName || !customerAddress) {
      return res.status(400).json({ error: 'Amount, customer ID, payment method ID, customer name, and customer address are required' });
    }
  
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        description: 'Ride booking donation payment',
        off_session: true,
        confirm: true,
        payment_method_types: ['card'],
        shipping: {
          name: customerName,
          address: customerAddress,
        },
      });
  
      res.json({ paymentIntent });
    } catch (error) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: 'Error charging customer.' });
    }
  };
  

  createSetupIntent = async (req, res) => {
    const { stripeCustomerId } = req.body;
  
    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
  
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        usage: 'off_session',
      });
  
      res.json({ setupIntentClientSecret: setupIntent.client_secret });
    } catch (error) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: 'Error creating setup intent.' });
    }
  };

  
findAccount = async (req, res) => {
    const { email, firstName, lastName } = req.body;
  
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, first name, and last name are required' });
    }
  
    try {
      const user = await User.findOne({ email, firstName, lastName });
  
      if (!user) {
        return res.status(400).json({ message: 'Account not found' });
      }
  
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Error finding account', error });
    }
  };

  
  forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'No user found with that email' });
      }
  
      const resetToken = generateToken(user._id);
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/${resetToken}`;
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending password reset email', error });
    }
  };

  
  resetPassword = async (req, res) => {
    const { token, password } = req.body;
  
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
      }
  
      user.password = encrypt(password);
      await user.save();
  
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error });
    }
  };
  

  module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    changePassword,
    createCheckoutSession,
    createCustomer,
    createPaymentIntent,
    createSetupIntent,
    findAccount,
    forgotPassword,
    resetPassword,
  };