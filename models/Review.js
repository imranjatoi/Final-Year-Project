const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order:               { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  buyer:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing:             { type: mongoose.Schema.Types.ObjectId, ref: 'PlantListing', required: true },
  sellerRating:        { type: Number, required: true, min: 1, max: 5 },
  plantConditionRating:{ type: Number, required: true, min: 1, max: 5 },
  packagingRating:     { type: Number, required: true, min: 1, max: 5 },
  overallRating:       { type: Number },
  comment:             { type: String, default: '' },
}, { timestamps: true });

reviewSchema.pre('save', function(next) {
  this.overallRating = parseFloat(((this.sellerRating + this.plantConditionRating + this.packagingRating) / 3).toFixed(1));
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
