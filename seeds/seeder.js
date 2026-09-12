require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const PlantListing = require('../models/PlantListing');
const Order    = require('../models/Order');
const Review   = require('../models/Review');
const PlantCareEntry = require('../models/PlantCareEntry');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/baghban')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error(err); process.exit(1); });

const hash = async (pw) => bcrypt.hash(pw, 12);

async function seed() {
  try {
    // Clear all
    await Promise.all([
      User.deleteMany({}), PlantListing.deleteMany({}),
      Order.deleteMany({}), Review.deleteMany({}), PlantCareEntry.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Admin ──
    const admin = await User.create({
      name: 'Admin Baghban', email: 'admin@baghban.pk',
      passwordHash: await hash('admin123'), role: 'admin',
      phone: '0300-0000000', city: 'Lahore', isActive: true
    });

    // ── Sellers ──
    const sellerData = [
      { name: 'Ahmed Malik',   email: 'ahmed@baghban.pk',   city: 'Lahore',     businessName: 'Green Roots Nursery',    sellerDescription: 'Specializing in rare indoor plants and succulents. 10+ years experience.',  phone: '0300-1111111' },
      { name: 'Sara Khan',     email: 'sara@baghban.pk',     city: 'Karachi',    businessName: 'Sara Plant Studio',      sellerDescription: 'Beautiful flowering plants and home decor greenery. We deliver across Karachi.', phone: '0301-2222222' },
      { name: 'Usman Farooq',  email: 'usman@baghban.pk',    city: 'Islamabad',  businessName: 'Capital Gardens',        sellerDescription: 'Premium outdoor plants and landscaping plants. Wholesale and retail.', phone: '0302-3333333' },
      { name: 'Ayesha Noor',   email: 'ayesha@baghban.pk',   city: 'Faisalabad', businessName: "Ayesha's Plant Corner",  sellerDescription: 'Herbs, medicinal plants and kitchen garden specialists.', phone: '0303-4444444' },
      { name: 'Bilal Hassan',  email: 'bilal@baghban.pk',    city: 'Lahore',     businessName: 'Bilal Botanics',         sellerDescription: 'Cacti, succulents and drought-resistant plants. Perfect for beginners.', phone: '0304-5555555' },
    ];
    const sellers = [];
    for (const s of sellerData) {
      const seller = await User.create({
        ...s, passwordHash: await hash('seller123'), role: 'seller',
        isVerified: true, verificationStatus: 'verified',
        averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        totalReviews: Math.floor(5 + Math.random() * 20), isActive: true
      });
      sellers.push(seller);
    }

    // ── Buyers ──
    const buyerData = [
      { name: 'Zara Ali',       email: 'zara@example.com',   city: 'Lahore',    phone: '0305-6666666', address: 'House 12, DHA Phase 5, Lahore' },
      { name: 'Haris Raza',     email: 'haris@example.com',  city: 'Karachi',   phone: '0306-7777777', address: 'Flat 3B, Clifton Block 4, Karachi' },
      { name: 'Nadia Iqbal',    email: 'nadia@example.com',  city: 'Islamabad', phone: '0307-8888888', address: 'House 7, F-8/3, Islamabad' },
    ];
    const buyers = [];
    for (const b of buyerData) {
      const buyer = await User.create({
        ...b, passwordHash: await hash('buyer123'), role: 'buyer', isActive: true
      });
      buyers.push(buyer);
    }

    // ── Pending seller ──
    await User.create({
      name: 'Pending Seller', email: 'pending@baghban.pk',
      passwordHash: await hash('seller123'), role: 'seller',
      city: 'Multan', businessName: 'Multan Plant Hub',
      sellerDescription: 'Fresh plants from Multan region.',
      phone: '0308-9999999', verificationStatus: 'pending', isActive: true
    });

    console.log('👥 Users created');

    // ── Plant Listings ──
    const plantData = [
      // Ahmed – Lahore
      { seller: sellers[0]._id, title: 'Monstera Deliciosa – Large', description: 'Beautiful large Monstera with 6+ leaves. Perfect for living rooms. Healthy and well-rooted. Comes in a 10-inch decorative pot.', price: 2500, category: 'indoor', city: 'Lahore', images: ['/images/plants/monstera.jpg'], careLevel: 'easy', sunlight: 'medium', watering: 'weekly', stock: 3, tags: ['rare','air-purifying','instagram-worthy'] },
      { seller: sellers[0]._id, title: 'Peace Lily Plant', description: 'Elegant white flowering Peace Lily. Air purifying and low maintenance. Great for bedrooms and offices.', price: 800, category: 'indoor', city: 'Lahore', images: ['/images/plants/peace-lily.jpg'], careLevel: 'easy', sunlight: 'low', watering: 'weekly', stock: 5 },
      { seller: sellers[0]._id, title: 'Snake Plant – Sansevieria', description: 'Tough and trendy snake plant. Survives neglect, perfect for beginners. Available in multiple sizes.', price: 600, category: 'indoor', city: 'Lahore', images: ['/images/plants/snake-plant.jpg'], careLevel: 'easy', sunlight: 'low', watering: 'biweekly', stock: 8, tags: ['beginner-friendly','air-purifying'] },
      // Sara – Karachi
      { seller: sellers[1]._id, title: 'Red Rose Bush – Double Petals', description: 'Stunning red double-petal rose bush. Currently in full bloom. Ideal for garden borders and pots.', price: 1200, category: 'flowering', city: 'Karachi', images: ['/images/plants/red-rose.jpg'], careLevel: 'moderate', sunlight: 'high', watering: 'daily', stock: 4, tags: ['flowering','fragrant','gift'] },
      { seller: sellers[1]._id, title: 'Jasmine Vine – Motia', description: 'Fragrant Motia jasmine perfect for balconies and fences. Blooms heavily in spring. Well-established plant.', price: 950, category: 'flowering', city: 'Karachi', images: ['/images/plants/jasmine.jpg'], careLevel: 'moderate', sunlight: 'high', watering: 'daily', stock: 6, tags: ['fragrant','flowering'] },
      { seller: sellers[1]._id, title: 'Pothos – Golden', description: 'Easy-care trailing Golden Pothos. Perfect for shelves and hanging baskets. Almost impossible to kill!', price: 450, category: 'indoor', city: 'Karachi', images: ['/images/plants/pothos.jpg'], careLevel: 'easy', sunlight: 'low', watering: 'weekly', stock: 10, tags: ['beginner-friendly','trailing'] },
      // Usman – Islamabad
      { seller: sellers[2]._id, title: 'Fiddle Leaf Fig Tree', description: 'Iconic Fiddle Leaf Fig, 3 feet tall. Statement plant for modern interiors. Healthy and full. Requires bright indirect light.', price: 4500, category: 'indoor', city: 'Islamabad', images: ['/images/plants/fiddle-leaf.jpg'], careLevel: 'expert', sunlight: 'high', watering: 'weekly', stock: 2, tags: ['statement-plant','rare'] },
      { seller: sellers[2]._id, title: 'Bamboo Plant – Lucky', description: 'Classic Lucky Bamboo arrangement in decorative ceramic pot. Great housewarming gift. Available in 2, 3, 5 and 7 stalk arrangements.', price: 700, category: 'indoor', city: 'Islamabad', images: ['/images/plants/bamboo.jpg'], careLevel: 'easy', sunlight: 'medium', watering: 'weekly', stock: 12, tags: ['lucky','gift','feng-shui'] },
      { seller: sellers[2]._id, title: 'Bougainvillea – Pink', description: 'Vibrant pink Bougainvillea climber. Perfect for walls, pergolas and large pots. Drought tolerant once established.', price: 1800, category: 'outdoor', city: 'Islamabad', images: ['/images/plants/bougainvillea.jpg'], careLevel: 'moderate', sunlight: 'high', watering: 'every2days', stock: 5, tags: ['climbing','colorful','outdoor'] },
      // Ayesha – Faisalabad
      { seller: sellers[3]._id, title: 'Tulsi – Holy Basil Plant', description: 'Fresh and aromatic Tulsi plant. Medicinal herb used in teas and cooking. Grow your own healthy herb garden.', price: 300, category: 'herbs', city: 'Faisalabad', images: ['/images/plants/tulsi.jpg'], careLevel: 'easy', sunlight: 'high', watering: 'daily', stock: 15, tags: ['medicinal','herb','kitchen-garden'] },
      { seller: sellers[3]._id, title: 'Mint – Spearmint Variety', description: 'Fresh spearmint with strong aroma. Perfect for teas, chutneys and cocktails. Grows aggressively – great for pots.', price: 250, category: 'herbs', city: 'Faisalabad', images: ['/images/plants/mint.jpg'], careLevel: 'easy', sunlight: 'medium', watering: 'daily', stock: 20, tags: ['herb','kitchen-garden','edible'] },
      { seller: sellers[3]._id, title: 'Aloe Vera – Large', description: 'Mature large Aloe Vera plant with many offsets. Excellent for skin care and burns. Very low maintenance.', price: 500, category: 'succulents', city: 'Faisalabad', images: ['/images/plants/aloe.jpg'], careLevel: 'easy', sunlight: 'high', watering: 'biweekly', stock: 7, tags: ['medicinal','succulent','beginner-friendly'] },
      // Bilal – Lahore
      { seller: sellers[4]._id, title: 'Mixed Succulent Collection – 6 Pack', description: 'Beautiful set of 6 different succulents in small terracotta pots. Perfect desk or windowsill display. Each plant is labelled.', price: 1500, category: 'succulents', city: 'Lahore', images: ['/images/plants/succulents.jpg'], careLevel: 'easy', sunlight: 'high', watering: 'biweekly', stock: 4, tags: ['collection','gift','succulent','beginner-friendly'] },
      { seller: sellers[4]._id, title: 'Cactus – Barrel Cactus', description: 'Classic barrel cactus. Extremely low water needs. Perfect for sunny windowsills. Comes in a nice ceramic pot.', price: 800, category: 'succulents', city: 'Lahore', images: ['/images/plants/cactus.jpg'], careLevel: 'easy', sunlight: 'high', watering: 'biweekly', stock: 9, tags: ['cactus','low-maintenance','beginner-friendly'] },
      { seller: sellers[4]._id, title: 'ZZ Plant – Zamioculcas', description: 'Nearly indestructible ZZ plant. Handles low light and irregular watering. Glossy green leaves. Excellent for offices.', price: 1100, category: 'indoor', city: 'Lahore', images: ['/images/plants/zz-plant.jpg'], careLevel: 'easy', sunlight: 'low', watering: 'biweekly', stock: 6, tags: ['low-light','office-plant','beginner-friendly'] },
    ];

    const listings = await PlantListing.insertMany(plantData);
    console.log(`🌿 ${listings.length} plant listings created`);

    // ── Orders ──
    const order1 = await Order.create({
      buyer: buyers[0]._id, seller: sellers[0]._id, listing: listings[0]._id,
      quantity: 1, totalPrice: 2500, deliveryType: 'delivery',
      deliveryAddress: 'House 12, DHA Phase 5, Lahore',
      status: 'delivered', reviewSubmitted: false,
      statusHistory: [
        { status: 'placed',     changedAt: new Date(Date.now()-7*86400000), note: 'Order placed by buyer.' },
        { status: 'confirmed',  changedAt: new Date(Date.now()-6*86400000), note: 'Confirmed by seller.' },
        { status: 'dispatched', changedAt: new Date(Date.now()-4*86400000), note: 'Plant dispatched.' },
        { status: 'delivered',  changedAt: new Date(Date.now()-2*86400000), note: 'Delivered successfully.' },
      ]
    });

    const order2 = await Order.create({
      buyer: buyers[1]._id, seller: sellers[1]._id, listing: listings[3]._id,
      quantity: 2, totalPrice: 2400, deliveryType: 'delivery',
      deliveryAddress: 'Flat 3B, Clifton Block 4, Karachi',
      status: 'confirmed', reviewSubmitted: false,
      statusHistory: [
        { status: 'placed',    changedAt: new Date(Date.now()-2*86400000), note: 'Order placed by buyer.' },
        { status: 'confirmed', changedAt: new Date(Date.now()-1*86400000), note: 'Confirmed by seller.' },
      ]
    });

    const order3 = await Order.create({
      buyer: buyers[2]._id, seller: sellers[2]._id, listing: listings[6]._id,
      quantity: 1, totalPrice: 4500, deliveryType: 'pickup',
      status: 'placed', reviewSubmitted: false,
      statusHistory: [{ status: 'placed', changedAt: new Date(), note: 'Order placed by buyer.' }]
    });

    const order4 = await Order.create({
      buyer: buyers[0]._id, seller: sellers[4]._id, listing: listings[12]._id,
      quantity: 1, totalPrice: 1500, deliveryType: 'delivery',
      deliveryAddress: 'House 12, DHA Phase 5, Lahore',
      status: 'delivered', reviewSubmitted: true,
      statusHistory: [
        { status: 'placed',     changedAt: new Date(Date.now()-14*86400000) },
        { status: 'confirmed',  changedAt: new Date(Date.now()-13*86400000) },
        { status: 'dispatched', changedAt: new Date(Date.now()-11*86400000) },
        { status: 'delivered',  changedAt: new Date(Date.now()-9*86400000) },
      ]
    });

    console.log('📦 Orders created');

    // ── Reviews ──
    const rev1 = await Review.create({
      order: order4._id, buyer: buyers[0]._id, seller: sellers[4]._id, listing: listings[12]._id,
      sellerRating: 5, plantConditionRating: 5, packagingRating: 4,
      comment: 'Amazing succulents! They arrived perfectly packed and all 6 are thriving. Bilal was very responsive and the plants were exactly as described. Highly recommend!'
    });

    const rev2 = await Review.create({
      order: order1._id, buyer: buyers[0]._id, seller: sellers[0]._id, listing: listings[0]._id,
      sellerRating: 5, plantConditionRating: 5, packagingRating: 5,
      comment: 'The Monstera is absolutely stunning! Huge leaves and very healthy. Ahmed wrapped it so carefully – not a single leaf was damaged. Will definitely order again!'
    });
    await Order.findByIdAndUpdate(order1._id, { reviewSubmitted: true });

    // Update seller ratings
    for (const seller of sellers) {
      const reviews = await Review.find({ seller: seller._id });
      if (reviews.length > 0) {
        const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
        await User.findByIdAndUpdate(seller._id, { averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
      }
    }

    console.log('⭐ Reviews created');

    // ── Plant Care Entries ──
    await PlantCareEntry.insertMany([
      {
        buyer: buyers[0]._id, plantName: 'My Monstera', plantType: 'Monstera Deliciosa',
        image: '/images/plants/monstera.jpg',
        wateringFrequencyDays: 7, lastWateredDate: new Date(Date.now() - 5*86400000),
        sunlightNeeds: 'medium', fertilizingDays: 30, notes: 'Keep away from direct sunlight'
      },
      {
        buyer: buyers[0]._id, plantName: 'Succulent Garden', plantType: 'Mixed Succulents',
        image: '/images/plants/succulents.jpg',
        wateringFrequencyDays: 14, lastWateredDate: new Date(Date.now() - 16*86400000),
        sunlightNeeds: 'high', fertilizingDays: 60, notes: 'Water only when soil is completely dry'
      },
      {
        buyer: buyers[2]._id, plantName: 'Office Fiddle Leaf', plantType: 'Ficus Lyrata',
        image: '/images/plants/fiddle-leaf.jpg',
        wateringFrequencyDays: 7, lastWateredDate: new Date(Date.now() - 2*86400000),
        sunlightNeeds: 'high', notes: 'Do not move around – hates being relocated'
      },
    ]);

    console.log('🪴 Plant care entries created');

    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('   Admin:  admin@baghban.pk    / admin123');
    console.log('   Seller: ahmed@baghban.pk    / seller123');
    console.log('   Seller: sara@baghban.pk     / seller123');
    console.log('   Buyer:  zara@example.com    / buyer123');
    console.log('   Buyer:  haris@example.com   / buyer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
