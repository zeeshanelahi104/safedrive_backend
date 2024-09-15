const mongoose = require('mongoose');

// Define the LocationSchema
const LocationSchema = new mongoose.Schema({
  address: { type: String, required: false },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});
const selectedRideSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  baseRate: { type: Number, required: true },
  donation: { type: Number, required: true },
  totalRate: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});
// Define the RideQuoteSchema
const RideQuoteSchema = new mongoose.Schema({
  pickup: { type: LocationSchema, required: true },
  destination: { type: LocationSchema, required: true },
  stop: { type: LocationSchema, required: true },
  persons: { type: Number, required: true },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  returnPickupTime: { type: String },
  additionalInfo: { type: String },
  rideType: { type: String, required: true },
  mapLocation: { type: LocationSchema, required: true },
  selectedRide: {
    type: selectedRideSchema, // Use the imported selectedRideSchema
    required: false,
  },
}, {
  timestamps: true,
});

// Create and export the RideQuote model
let RideQuote;

try {
  RideQuote = mongoose.model('RideQuote');
} catch (e) {
  RideQuote = mongoose.model('RideQuote', RideQuoteSchema);
}

module.exports = RideQuote;
