const mongoose = require('mongoose');

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
        notificationType: { type: String, required: true },
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
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User model
    },
  ],
}, { timestamps: true });

// Create and export the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;





// import mongoose, { Schema } from "mongoose";
// import { IRideQuote, ISelectedRide, IUser } from "@/types";

// const selectedRideSchema = new mongoose.Schema<ISelectedRide>({
//   carName: { type: String, required: true },
//   baseRate: { type: Number, required: true },
//   donation: { type: Number, required: true },
//   totalRate: { type: Number, required: true },
//   imageUrl: { type: String, required: true },
// });
// // Define the schema for ILocation (used in IRideQuote)
// const locationSchema = new Schema({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
//   address: { type: String },
// });
// // Define the schema for IRideQuote
// const rideQuoteSchema = new Schema<IRideQuote>(
//   {
//     pickup: { type: locationSchema, required: true },
//     destination: { type: locationSchema, required: true },
//     stop: { type: locationSchema, required: true },
//     persons: { type: Number, required: true },
//     pickupDate: { type: String, required: true },
//     pickupTime: { type: String, required: true },
//     returnPickupTime: { type: String },
//     additionalInfo: { type: String },
//     rideType: { type: String, required: true },
//     notificationType: { type: String, required: true },
//     status: { type: String },
//     paymentMethod: { type: String },
//     mapLocation: { type: locationSchema, required: true },
//     selectedRide: { type: selectedRideSchema, required: true },
//   },
//   { timestamps: true }
// );
// const userSchema = new mongoose.Schema<IUser>(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     firstName: {
//       type: String,
//       required: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     address: {
//       line1: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       postal_code: { type: String, required: true },
//       country: { type: String, required: true },
//     },
//     billingDetails: {
//       cardHolderName: { type: String, required: true },
//       cardType: { type: String, required: true },
//       expirationDate: { type: String, required: true },
//       last4: { type: String, required: true },
//     },
//     stripeCustomerId: {
//       type: String,
//     },
//     paymentMethodId: {
//       type: String,
//     },
//     setupIntentClientSecret: {
//       type: String,
//     },
//     role: {
//       type: String,
//       enum: ["user", "driver", "admin"],
//       default: "user",
//     },
//     selectedReservations: [
//       {
//         reservation: rideQuoteSchema, // Embedding the rideQuoteSchema
//         paymentIntentId: { type: String },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const User = mongoose.models.User || mongoose.model("User", userSchema);
// export default User;
