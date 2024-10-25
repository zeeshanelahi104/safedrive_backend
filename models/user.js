const mongoose = require("mongoose");

// Define the userSchema
const userSchema = new mongoose.Schema(
  {
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
      line1: { type: String },
      city: { type: String },
      state: { type: String },
      postal_code: { type: String },
      country: { type: String },
    },
    billingDetails: {
      cardHolderName: { type: String },
      cardType: { type: String },
      expirationDate: { type: String },
      last4: { type: String },
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
    },
    selectedReservations: [
      {
        reservation: {
          pickup: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          destination: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          stop: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String },
          },
          persons: { type: Number, required: true },
          pickupDate: { type: String, required: true },
          pickupTime: { type: String, required: true },
          returnPickupTime: { type: String },
          additionalInfo: { type: String },
          rideType: { type: String, required: true },
          notificationType: { type: String, required: false },
          status: { type: String },
          paymentMethod: { type: String },
          mapLocation: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          selectedRide: {
            carName: { type: String, required: true },
            baseRate: { type: Number, required: true },
            donation: { type: Number, required: true },
            totalRate: { type: Number, required: true },
            imageUrl: { type: String, required: true },
          },
        },
        paymentIntentId: { type: String },
        rideStatus: {
          type: String,
          enum: ["Pending", "Accepted", "Offered", "Confirmed", "Previous"], // Add any other statuses as needed
          default: "Pending", // Set a default status if necessary
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Add userId
        reservationId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    quotes: [
      {
        quote: {
          pickup: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          destination: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          stop: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String },
          },
          persons: { type: Number, required: true },
          pickupDate: { type: String, required: true },
          pickupTime: { type: String, required: true },
          returnPickupTime: { type: String },
          additionalInfo: { type: String },
          rideType: { type: String, required: true },
          notificationType: { type: String, required: false },
          status: {
            type: String,
            enum: ["Pending", "Confirmed", "Previous"],
            default: "Pending",
          },
          paymentMethod: { type: String },
          mapLocation: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            address: { type: String },
          },
          selectedRide: {
            carName: { type: String, required: true },
            baseRate: { type: Number, required: true },
            donation: { type: Number, required: true },
            totalRate: { type: Number, required: true },
            imageUrl: { type: String, required: true },
          },
        }, // Use the RideQuoteSchema here
      },
    ],
    // Optional company profile details
    companyProfile: {
      businessName: { type: String, default: "" },
      address: {
        line1: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postal_code: { type: String, default: "" },
        country: { type: String, default: "" },
      },
      metroArea: { type: String, default: "" },
      officePhone: { type: String, default: "" },
      cellPhone: { type: String, default: "" },
      operatorLicense: { type: String, default: "" },
      taxId: { type: String, default: "" },
      area: { type: String, default: "" },
      notification: {
        type: String,
        enum: ["By E-mail", "By Text", "By E-mail and Text"],
        default: "By E-mail",
      },
      nlaMember: { type: String, enum: ["yes", "no"], default: "no" },
    },
    vehiclesDetails: [
      {
        type: { type: String },
        passengers: { type: Number },
        numberOfVehicles: { type: Number },
        images: { type: Map, of: [String], default: {} },
      },
    ],
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
