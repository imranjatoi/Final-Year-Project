const PlantListing = require('../models/PlantListing');
const User         = require('../models/User');
const Review       = require('../models/Review');

exports.getHome = async (req, res) => {
  try {
    const featured = await PlantListing.find({ isAvailable: true })
      .populate('seller', 'name city isVerified businessName averageRating')
      .sort({ createdAt: -1 }).limit(8);
    const categories = ['indoor','outdoor','succulents','flowering','herbs','trees','aquatic','other'];
    const stats = {
      plants:  await PlantListing.countDocuments({ isAvailable: true }),
      sellers: await User.countDocuments({ role: 'seller', isVerified: true }),
      buyers:  await User.countDocuments({ role: 'buyer' }),
      reviews: await Review.countDocuments()
    };
    res.render('index', { title: 'Baghban – Pakistan\'s Verified Plant Marketplace', featured, categories, stats });
  } catch (err) { console.error(err); res.render('index', { title: 'Baghban', featured: [], categories: [], stats: {} }); }
};

exports.browsePlants = async (req, res) => {
  try {
    const { search, city, category, minPrice, maxPrice, careLevel, sort, page = 1 } = req.query;
    const limit = 12; const skip = (page - 1) * limit;
    const query = { isAvailable: true };
    if (search)   {
      // Use regex fallback if text index not available
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }
    if (city && city !== 'all') {
      const sellers = await User.find({ city: new RegExp(city, 'i'), role: 'seller', isVerified: true }).select('_id');
      query.seller = { $in: sellers.map(s => s._id) };
    }
    if (category && category !== 'all') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (careLevel && careLevel !== 'all') query.careLevel = careLevel;
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc')  sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'popular')    sortObj = { views: -1 };
    const [plants, total] = await Promise.all([
      PlantListing.find(query).populate('seller','name city isVerified businessName averageRating').sort(sortObj).skip(skip).limit(limit),
      PlantListing.countDocuments(query)
    ]);
    const cities = await User.distinct('city', { role: 'seller', isVerified: true });
    res.render('plants/browse', {
      title: 'Browse Plants – Baghban', plants, cities, total,
      page: Number(page), pages: Math.ceil(total / limit),
      filters: { search, city, category, minPrice, maxPrice, careLevel, sort }
    });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.getPlantDetail = async (req, res) => {
  try {
    const plant = await PlantListing.findById(req.params.id)
      .populate('seller', 'name city isVerified businessName averageRating totalReviews avatar sellerDescription phone');
    if (!plant) { req.flash('error', 'Plant not found.'); return res.redirect('/plants'); }
    await PlantListing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const reviews = await Review.find({ seller: plant.seller._id })
      .populate('buyer', 'name avatar').sort({ createdAt: -1 }).limit(5);
    const related = await PlantListing.find({
      category: plant.category, _id: { $ne: plant._id }, isAvailable: true
    }).populate('seller','name city isVerified averageRating').limit(4);
    res.render('plants/detail', { title: `${plant.title} – Baghban`, plant, reviews, related });
  } catch (err) { console.error(err); res.redirect('/plants'); }
};
