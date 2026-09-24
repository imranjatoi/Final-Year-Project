const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone:        { type: String, default: '' },
  role:         { type: String, enum: ['buyer','seller','admin'], default: 'buyer' },
  avatar:       { type: String, default: '/images/default-avatar.png' },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },
  // seller-specific
  businessName:        { type: String, default: '' },
  sellerDescription:   { type: String, default: '' },
  isVerified:          { type: Boolean, default: false },
  verificationStatus:  { type: String, enum: ['none','pending','verified','rejected'], default: 'none' },
  rejectionReason:     { type: String, default: '' },
  averageRating:       { type: Number, default: 0 },
  totalReviews:        { type: Number, default: 0 },
  isActive:            { type: Boolean, default: true },
  resetPasswordToken:   { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(raw) {
  return bcrypt.compare(raw, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
