const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing:      { type: mongoose.Schema.Types.ObjectId, ref: 'PlantListing', required: true },
  quantity:     { type: Number, default: 1, min: 1 },
  totalPrice:   { type: Number, required: true },
  deliveryType: { type: String, enum: ['pickup','delivery'], default: 'delivery' },
  deliveryAddress: { type: String, default: '' },
  status: {
    type: String,
    enum: ['placed','confirmed','dispatched','delivered','rejected','cancelled'],
    default: 'placed'
  },
  rejectionReason: { type: String, default: '' },
  reviewSubmitted: { type: Boolean, default: false },
  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
