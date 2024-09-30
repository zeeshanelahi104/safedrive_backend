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
  searchReservation,
  getUserById,
  searchByPhone,
  updateCompanyProfile,
  addOrUpdateVehicleDetails,
  getAllReservations,
  getUsersByIds,
  getPaymentMethod,
  updateUserData,
  updateDriverData,
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
router.post('/create-customer', createCustomer);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/create-setup-intent', createSetupIntent);
router.post('/get-payment-method', getPaymentMethod);
router.get('/users', getAllUsers); // Admin route
router.get('/users', getUsersByIds); // Admin route
router.get('/getAllReservations', getAllReservations); // Admin route
// GET user by ID
router.get('/:id', getUserById);
router.route('/profile/:id').get(getUserProfile);
// Reservation search route
router.post('/searchReservation', searchReservation);
router.post('/searchByPhone', searchByPhone);
// router.route('/verify-password').post(verifyCurrentPassword);
// User profile routes
router.route('/profile/:id').put( updateUserProfile);
router.route('/userProfile/:userId').put( updateUserData);
router.route('/driverProfile/:driverId').put( updateDriverData);
router.route('/updateCompanyProfile/:id').put( updateCompanyProfile);
router.put('/add-or-update-vehicle-details/:userId', addOrUpdateVehicleDetails);
module.exports = router;
