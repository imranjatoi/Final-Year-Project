const Review = require('../models/Review');
const Order  = require('../models/Order');
const User   = require('../models/User');

exports.submitReview = async (req, res) => {
  try {
    const { orderId, sellerRating, plantConditionRating, packagingRating, comment } = req.body;
    const order = await Order.findById(orderId).populate('seller','_id name email');
    if (!order || order.buyer.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Invalid order.'); return res.redirect('/orders');
    }
    if (order.status !== 'delivered') {
      req.flash('error', 'Review only allowed after delivery.'); return res.redirect('/orders/' + orderId);
    }
    if (order.reviewSubmitted) {
      req.flash('error', 'You have already reviewed this order.'); return res.redirect('/orders/' + orderId);
    }
    const review = await Review.create({
      order: orderId, buyer: req.session.user._id,
      seller: order.seller._id, listing: order.listing,
      sellerRating: Number(sellerRating),
      plantConditionRating: Number(plantConditionRating),
      packagingRating: Number(packagingRating),
      comment
    });
    order.reviewSubmitted = true;
    await order.save();
    // Update seller avg rating
    const reviews = await Review.find({ seller: order.seller._id });
    const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
    await User.findByIdAndUpdate(order.seller._id, {
      averageRating: parseFloat(avg.toFixed(1)),
      totalReviews: reviews.length
    });
    req.flash('success', 'Review submitted successfully. Thank you!');
    res.redirect('/orders/' + orderId);
  } catch (err) {
    if (err.code === 11000) { req.flash('error', 'Already reviewed.'); return res.redirect('/orders'); }
    console.error(err); req.flash('error', 'Failed to submit review.'); res.redirect('/orders');
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('buyer','name avatar')
      .populate('listing','title')
      .sort({ createdAt: -1 });
    res.render('reviews/sellerReviews', { title: 'Seller Reviews – Baghban', reviews });
  } catch (err) { res.redirect('/'); }
};
