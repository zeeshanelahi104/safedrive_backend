const mongoose = require('mongoose');

const ExtraHoursSchema = new mongoose.Schema({
  h1: { type: Number, required: true },
  h2: { type: Number, required: true },
  h3: { type: Number, required: true },
  h4: { type: Number, required: true },
  h5: { type: Number, required: true },
  h6: { type: Number, required: true },
  h7: { type: Number, required: true },
  h8: { type: Number, required: true },
});

const TierSchema = new mongoose.Schema({
  rtow: { type: Number, required: true },
  hr: { type: Number, required: true },
});

const VehicleRateSchema = new mongoose.Schema({
  vehicle: { type: String, required: true },
  tier0: { type: TierSchema, required: true },
  tier1: { type: TierSchema, required: true },
  tier2: { type: TierSchema, required: true },
  tier3: { type: TierSchema, required: true },
  tier4: { type: TierSchema, required: true },
  extraHours: { type: ExtraHoursSchema, required: true },
});

module.exports = mongoose.model('VehicleRate', VehicleRateSchema);
