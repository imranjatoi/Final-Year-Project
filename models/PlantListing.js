const mongoose = require('mongoose');

const plantListingSchema = new mongoose.Schema({
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, enum: ['indoor','outdoor','succulents','flowering','herbs','trees','aquatic','other'], default: 'indoor' },
  city:        { type: String, required: true },
  area:        { type: String, default: '' },
  images:      [{ type: String }],
  careLevel:   { type: String, enum: ['easy','moderate','expert'], default: 'easy' },
  sunlight:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  watering:    { type: String, enum: ['daily','every2days','weekly','biweekly'], default: 'weekly' },
  stock:       { type: Number, default: 1, min: 0 },
  isAvailable: { type: Boolean, default: true },
  tags:        [{ type: String }],
  views:       { type: Number, default: 0 },
}, { timestamps: true });

plantListingSchema.index({ city: 1, isAvailable: 1 });
// Text search handled via regex in controller for compatibility
plantListingSchema.index({ city: 1, category: 1, isAvailable: 1 });

module.exports = mongoose.model('PlantListing', plantListingSchema);
