const Order       = require('../models/Order');
const PlantListing = require('../models/PlantListing');
const User        = require('../models/User');
const email       = require('../config/email');

exports.placeOrder = async (req, res) => {
  try {
    const { listingId, quantity = 1, deliveryType, deliveryAddress } = req.body;
    const listing = await PlantListing.findById(listingId).populate('seller','_id name email city');
    if (!listing || !listing.isAvailable) {
      req.flash('error', 'This plant is no longer available.');
      return res.redirect('/plants/' + listingId);
    }
    if (listing.seller.toString() === req.session.user._id.toString()) {
      req.flash('error', 'You cannot order your own listing.');
      return res.redirect('/plants/' + listingId);
    }
    const order = await Order.create({
      buyer: req.session.user._id, seller: listing.seller._id,
      listing: listingId, quantity: Number(quantity),
      totalPrice: listing.price * Number(quantity),
      deliveryType, deliveryAddress,
      statusHistory: [{ status: 'placed', note: 'Order placed by buyer.' }]
    });
    // reduce stock
    if (listing.stock <= 1) await PlantListing.findByIdAndUpdate(listingId, { isAvailable: false, stock: 0 });
    else await PlantListing.findByIdAndUpdate(listingId, { $inc: { stock: -1 } });
    // notify seller
    try { await email.sendOrderNotification(listing.seller.email, listing.seller.name, order._id); } catch(e){}
    req.flash('success', 'Order placed successfully!');
    res.redirect('/orders/' + order._id);
  } catch (err) { console.error(err); req.flash('error', 'Failed to place order.'); res.redirect('/plants'); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.user._id })
      .populate('listing','title images price')
      .populate('seller','name businessName city')
      .sort({ createdAt: -1 });
    res.render('buyer/orders', { title: 'My Orders – Baghban', orders });
  } catch (err) { res.redirect('/'); }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listing')
      .populate('buyer','name email phone')
      .populate('seller','name email phone businessName city');
    if (!order) { req.flash('error','Order not found.'); return res.redirect('/orders'); }
    const isOwner = order.buyer._id.toString() === req.session.user._id.toString()
                 || order.seller._id.toString() === req.session.user._id.toString()
                 || req.session.user.role === 'admin';
    if (!isOwner) { req.flash('error','Access denied.'); return res.redirect('/'); }
    res.render('orders/detail', { title: `Order #${order._id} – Baghban`, order });
  } catch (err) { res.redirect('/'); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, rejectionReason } = req.body;
    const order = await Order.findById(req.params.id).populate('buyer','name email').populate('listing','title');
    if (!order) { req.flash('error','Order not found.'); return res.redirect('/seller/orders'); }
    order.status = status;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();
    // if delivered, make listing available again if it was rejected before
    try { await email.sendOrderStatus(order.buyer.email, order.buyer.name, status, order._id); } catch(e){}
    req.flash('success', `Order status updated to ${status}.`);
    res.redirect('/seller/orders');
  } catch (err) { req.flash('error','Update failed.'); res.redirect('/seller/orders'); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.buyer.toString() !== req.session.user._id.toString()) {
      req.flash('error','Cannot cancel this order.');
      return res.redirect('/orders');
    }
    if (!['placed','confirmed'].includes(order.status)) {
      req.flash('error','Order cannot be cancelled at this stage.');
      return res.redirect('/orders/' + order._id);
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by buyer.' });
    await order.save();
    await PlantListing.findByIdAndUpdate(order.listing, { isAvailable: true, $inc: { stock: 1 } });
    req.flash('success','Order cancelled successfully.');
    res.redirect('/orders');
  } catch (err) { req.flash('error','Cancellation failed.'); res.redirect('/orders'); }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.buyer.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied.');
      return res.redirect('/orders');
    }
    if (order.status !== 'dispatched') {
      req.flash('error', 'Order is not dispatched yet.');
      return res.redirect('/orders/' + order._id);
    }
    order.status = 'delivered';
    order.statusHistory.push({ status: 'delivered', note: 'Marked as received by buyer.' });
    await order.save();
    req.flash('success', 'Order marked as delivered! Please leave a review for the seller.');
    res.redirect('/orders/' + order._id);
  } catch (err) {
    console.error('confirmDelivery error:', err);
    req.flash('error', 'Failed to update order.');
    res.redirect('/orders');
  }
};
