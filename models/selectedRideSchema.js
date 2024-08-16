const mongoose = require('mongoose');

// Define the selectedRideSchema based on the ISelectedRide interface
const selectedRideSchema = new mongoose.Schema({
  carName: {
    type: String,
    required: true
  },
  baseRate: {
    type: Number,
    required: true
  },
  donation: {
    type: Number,
    required: true
  },
  totalRate: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

// Export the schema to be used in other parts of the project
module.exports = selectedRideSchema;
