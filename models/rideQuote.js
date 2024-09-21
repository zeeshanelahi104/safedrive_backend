const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define Location Schema
const LocationSchema = new Schema({
  address: { type: String, required: false },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

// Define Selected Ride Schema
const selectedRideSchema = new Schema({
  carName: { type: String, required: true },
  baseRate: { type: Number, required: true },
  donation: { type: Number, required: true },
  totalRate: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});

// Define Ride Quote Schema
const RideQuoteSchema = new Schema(
  {
    pickup: { type: LocationSchema, required: true },
    destination: { type: LocationSchema, required: true },
    stop: { type: LocationSchema, required: true },
    persons: { type: Number, required: true },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    returnPickupTime: { type: String },
    additionalInfo: { type: String },
    rideType: { type: String, required: true },
    notificationType: {
      type: String,
      enum: ["email", "text", "email and text"],
      default: "email",
    },
    quoteType: {
      type: String,
      enum: ["incomplete", "completed", "abandoned"],
      default: "incomplete", // Default when a quote is first created
    },
    status: { type: String, default: "pending" },
    paymentMethod: { type: String, default: "cash" },
    mapLocation: { type: LocationSchema, required: true },
    selectedRide: {
      type: selectedRideSchema,
      required: false,
    },
    userId: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

// Create or retrieve RideQuote model
let RideQuote;

try {
  RideQuote = model("RideQuote");
} catch (e) {
  RideQuote = model("RideQuote", RideQuoteSchema);
}

module.exports = RideQuote;
