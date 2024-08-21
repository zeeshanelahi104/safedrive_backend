const express = require('express');
const {
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
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/find-account', findAccount);

// Protected routes
router.post('/change-password', protect, changePassword);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/create-customer', protect, createCustomer);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/create-setup-intent', protect, createSetupIntent);
router.get('/users', protect, admin, getAllUsers); // Admin route

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
