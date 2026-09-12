const PlantListing = require('../models/PlantListing');
const Order        = require('../models/Order');
const User         = require('../models/User');
const Review       = require('../models/Review');

// ─────────────────────────────────────────────────────────────
// GET /seller/dashboard
// ─────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const sellerId = req.session.user._id;

    const [listings, orders, seller, reviews] = await Promise.all([
      PlantListing.find({ seller: sellerId }).sort({ createdAt: -1 }),

      Order.find({ seller: sellerId })
        .populate('buyer', 'name email phone')
        .populate('listing', 'title images price')
        .sort({ createdAt: -1 })
        .limit(10),

      User.findById(sellerId),

      Review.find({ seller: sellerId })
        .populate('buyer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Revenue: sum of all delivered orders for this seller
    const revenue = await Order.find({ seller: sellerId, status: 'delivered' })
      .select('totalPrice')
      .then(deliveredOrders =>
        deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
      );

    const stats = {
      totalListings:   listings.length,
      activeListings:  listings.filter(l => l.isAvailable).length,
      totalOrders:     await Order.countDocuments({ seller: sellerId }),
      pendingOrders:   await Order.countDocuments({ seller: sellerId, status: 'placed' }),
      completedOrders: await Order.countDocuments({ seller: sellerId, status: 'delivered' }),
      revenue
    };

    res.render('seller/dashboard', {
      title:    'Seller Dashboard \u2013 Baghban',
      listings,
      orders,
      seller,
      reviews,
      stats
    });
  } catch (err) {
    console.error('sellerController.getDashboard error:', err);
    res.redirect('/');
  }
};

// ─────────────────────────────────────────────────────────────
// GET /seller/listings
// ─────────────────────────────────────────────────────────────
exports.getListings = async (req, res) => {
  try {
    const listings = await PlantListing
      .find({ seller: req.session.user._id })
      .sort({ createdAt: -1 });

    res.render('seller/listings', {
      title: 'My Listings \u2013 Baghban',
      listings
    });
  } catch (err) {
    console.error('sellerController.getListings error:', err);
    res.redirect('/seller/dashboard');
  }
};

// ─────────────────────────────────────────────────────────────
// GET /seller/add-listing
// ─────────────────────────────────────────────────────────────
exports.getAddListing = (req, res) => {
  res.render('seller/addListing', { title: 'Add Plant Listing \u2013 Baghban' });
};

// ─────────────────────────────────────────────────────────────
// POST /seller/add-listing
// ─────────────────────────────────────────────────────────────
exports.postAddListing = async (req, res) => {
  try {
    const {
      title, description, price, category,
      city, area, careLevel, sunlight,
      watering, stock, tags
    } = req.body;

    const sellerUser = await User.findById(req.session.user._id).select('city');

    const images = (req.files && req.files.length > 0)
      ? req.files.map(f => '/images/uploads/' + f.filename)
      : ['/images/plants/default-plant.jpg'];

    await PlantListing.create({
      seller:      req.session.user._id,
      title:       title.trim(),
      description: description.trim(),
      price:       Number(price),
      category,
      city:        city || (sellerUser && sellerUser.city) || '',
      area:        area || '',
      images,
      careLevel,
      sunlight,
      watering,
      stock:       Number(stock) || 1,
      isAvailable: true,
      tags:        tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : []
    });

    req.flash('success', 'Plant listing created successfully!');
    res.redirect('/seller/listings');
  } catch (err) {
    console.error('sellerController.postAddListing error:', err);
    req.flash('error', 'Failed to create listing. Please try again.');
    res.redirect('/seller/add-listing');
  }
};

// ─────────────────────────────────────────────────────────────
// GET /seller/edit-listing/:id
// ─────────────────────────────────────────────────────────────
exports.getEditListing = async (req, res) => {
  try {
    const listing = await PlantListing.findOne({
      _id:    req.params.id,
      seller: req.session.user._id
    });

    if (!listing) {
      req.flash('error', 'Listing not found or access denied.');
      return res.redirect('/seller/listings');
    }

    res.render('seller/editListing', {
      title: 'Edit Listing \u2013 Baghban',
      listing
    });
  } catch (err) {
    console.error('sellerController.getEditListing error:', err);
    res.redirect('/seller/listings');
  }
};

// ─────────────────────────────────────────────────────────────
// POST /seller/edit-listing/:id
// ─────────────────────────────────────────────────────────────
exports.postEditListing = async (req, res) => {
  try {
    const {
      title, description, price, category,
      city, area, careLevel, sunlight,
      watering, stock, isAvailable, tags
    } = req.body;

    const update = {
      title:       title.trim(),
      description: description.trim(),
      price:       Number(price),
      category,
      city,
      area:        area || '',
      careLevel,
      sunlight,
      watering,
      stock:       Number(stock),
      isAvailable: isAvailable === 'true',
      tags:        tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : []
    };

    if (req.files && req.files.length > 0) {
      update.images = req.files.map(f => '/images/uploads/' + f.filename);
    }

    const updated = await PlantListing.findOneAndUpdate(
      { _id: req.params.id, seller: req.session.user._id },
      update,
      { new: true }
    );

    if (!updated) {
      req.flash('error', 'Listing not found or access denied.');
      return res.redirect('/seller/listings');
    }

    req.flash('success', 'Listing updated successfully.');
    res.redirect('/seller/listings');
  } catch (err) {
    console.error('sellerController.postEditListing error:', err);
    req.flash('error', 'Update failed. Please try again.');
    res.redirect('/seller/listings');
  }
};

// ─────────────────────────────────────────────────────────────
// POST /seller/delete-listing/:id
// ─────────────────────────────────────────────────────────────
exports.deleteListing = async (req, res) => {
  try {
    const result = await PlantListing.findOneAndDelete({
      _id:    req.params.id,
      seller: req.session.user._id
    });

    if (!result) {
      req.flash('error', 'Listing not found or access denied.');
    } else {
      req.flash('success', 'Listing deleted successfully.');
    }
    res.redirect('/seller/listings');
  } catch (err) {
    console.error('sellerController.deleteListing error:', err);
    req.flash('error', 'Delete failed. Please try again.');
    res.redirect('/seller/listings');
  }
};

// ─────────────────────────────────────────────────────────────
// GET /seller/orders   ?status=all|placed|confirmed|...
// ─────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.session.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('buyer',   'name email phone')
      .populate('listing', 'title images price')
      .sort({ createdAt: -1 });

    res.render('seller/orders', {
      title:        'Manage Orders \u2013 Baghban',
      orders,
      filterStatus: status || 'all'
    });
  } catch (err) {
    console.error('sellerController.getOrders error:', err);
    res.redirect('/seller/dashboard');
  }
};
