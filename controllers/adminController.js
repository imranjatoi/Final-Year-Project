const User         = require('../models/User');
const PlantListing = require('../models/PlantListing');
const Order        = require('../models/Order');
const Review       = require('../models/Review');
const emailService = require('../config/email');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalSellers, pendingSellers, totalListings, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller', isVerified: true }),
      User.countDocuments({ role: 'seller', verificationStatus: 'pending' }),
      PlantListing.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.find().populate('buyer','name').populate('seller','name').populate('listing','title').sort({ createdAt: -1 }).limit(8)
    ]);
    const revenue = totalRevenue[0] ? totalRevenue[0].total : 0;
    res.render('admin/dashboard', {
      title: 'Admin Dashboard – Baghban',
      stats: { totalUsers, totalSellers, pendingSellers, totalListings, totalOrders, revenue },
      recentOrders
    });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.getPendingSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller', verificationStatus: 'pending' }).sort({ createdAt: 1 });
    res.render('admin/pendingSellers', { title: 'Pending Sellers – Baghban', sellers });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).sort({ createdAt: -1 });
    res.render('admin/allSellers', { title: 'All Sellers – Baghban', sellers });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.verifySeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) { req.flash('error','Seller not found.'); return res.redirect('/admin/sellers/pending'); }
    seller.isVerified = true;
    seller.verificationStatus = 'verified';
    await seller.save();
    try { await emailService.sendVerificationApproval(seller.email, seller.name); } catch(e) {}
    req.flash('success', `${seller.name} has been verified.`);
    res.redirect('/admin/sellers/pending');
  } catch (err) { req.flash('error','Action failed.'); res.redirect('/admin/sellers/pending'); }
};

exports.rejectSeller = async (req, res) => {
  try {
    const { reason } = req.body;
    const seller = await User.findById(req.params.id);
    if (!seller) { req.flash('error','Seller not found.'); return res.redirect('/admin/sellers/pending'); }
    seller.verificationStatus = 'rejected';
    seller.rejectionReason = reason || 'Application did not meet requirements.';
    await seller.save();
    try { await emailService.sendVerificationRejection(seller.email, seller.name, seller.rejectionReason); } catch(e) {}
    req.flash('success', `${seller.name}'s application rejected.`);
    res.redirect('/admin/sellers/pending');
  } catch (err) { req.flash('error','Action failed.'); res.redirect('/admin/sellers/pending'); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/dashboard');
    }
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `${user.name} has been ${user.isActive ? 'activated' : 'suspended'}.`);
    res.redirect(user.role === 'buyer' ? '/admin/users' : '/admin/sellers');
  } catch (err) {
    req.flash('error', 'Action failed.');
    res.redirect('/admin/dashboard');
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await PlantListing.find().populate('seller','name city businessName').sort({ createdAt: -1 });
    res.render('admin/listings', { title: 'All Listings – Baghban', listings });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.deleteListing = async (req, res) => {
  try {
    await PlantListing.findByIdAndDelete(req.params.id);
    req.flash('success','Listing removed.');
    res.redirect('/admin/listings');
  } catch (err) { req.flash('error','Delete failed.'); res.redirect('/admin/listings'); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer','name email')
      .populate('seller','name businessName')
      .populate('listing','title')
      .sort({ createdAt: -1 });
    res.render('admin/orders', { title: 'All Orders – Baghban', orders });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'buyer' }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'All Users – Baghban', users });
  } catch (err) { res.redirect('/admin/dashboard'); }
};
