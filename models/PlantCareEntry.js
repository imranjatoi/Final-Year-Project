const mongoose = require('mongoose');

const plantCareSchema = new mongoose.Schema({
  buyer:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plantName:           { type: String, required: true, trim: true },
  plantType:           { type: String, default: '' },
  image:               { type: String, default: '/images/plants/default-care.jpg' },
  wateringFrequencyDays:{ type: Number, required: true, min: 1 },
  lastWateredDate:     { type: Date, required: true },
  sunlightNeeds:       { type: String, enum: ['low','medium','high'], default: 'medium' },
  fertilizingDays:     { type: Number, default: 30 },
  lastFertilizedDate:  { type: Date, default: Date.now },
  notes:               { type: String, default: '' },
  isActive:            { type: Boolean, default: true },
}, { timestamps: true });

plantCareSchema.virtual('nextWateringDate').get(function() {
  const d = new Date(this.lastWateredDate);
  d.setDate(d.getDate() + this.wateringFrequencyDays);
  return d;
});

plantCareSchema.virtual('wateringStatus').get(function() {
  const today = new Date(); today.setHours(0,0,0,0);
  const next  = new Date(this.nextWateringDate); next.setHours(0,0,0,0);
  const diff  = Math.ceil((next - today) / (1000*60*60*24));
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 2)  return 'soon';
  return 'ok';
});

plantCareSchema.set('toJSON', { virtuals: true });
plantCareSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PlantCareEntry', plantCareSchema);
