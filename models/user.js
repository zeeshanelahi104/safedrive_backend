const mongoose = require('mongoose');
const selectedRideSchema = require('./selectedRideSchema'); // Import the selectedRideSchema

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  newPassword: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  stripeCustomerId: {
    type: String,
  },
  paymentMethodId: {
    type: String,
  },
  setupIntentClientSecret: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "driver", "admin"],
    default: "user",
  },
  selectedRides: [
    {
      ride: selectedRideSchema,
      paymentIntentId: { type: String },
    },
  ],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
