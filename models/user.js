const mongoose = require('mongoose');

// Define the selectedRideSchema
const selectedRideSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  baseRate: { type: Number, required: true },
  donation: { type: Number, required: true },
  totalRate: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});

// Define the locationSchema (used in rideQuoteSchema)
const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String },
});

// Define the rideQuoteSchema
const rideQuoteSchema = new mongoose.Schema({
  pickup: { type: locationSchema, required: true },
  destination: { type: locationSchema, required: true },
  stop: { type: locationSchema },
  persons: { type: Number, required: true },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  returnPickupTime: { type: String },
  additionalInfo: { type: String },
  rideType: { type: String, required: true },
  notificationType: { type: String, required: true },
  status: { type: String },
  paymentMethod: { type: String },
  mapLocation: { type: locationSchema, required: true },
  selectedRide: { type: selectedRideSchema, required: true },
}, { timestamps: true });

// Define the userSchema
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
  address: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  billingDetails: {
    cardHolderName: { type: String, required: true },
    cardType: { type: String, required: true },
    expirationDate: { type: String, required: true },
    last4: { type: String, required: true },
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
  selectedReservations: [
    {
      reservation: rideQuoteSchema, // Embedding the rideQuoteSchema
      paymentIntentId: { type: String },
    },
  ],
}, { timestamps: true });

// Create and export the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
