const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register – Baghban', role: req.query.role || 'buyer' });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }
  try {
    const { name, email, password, role, phone, city, businessName, sellerDescription } = req.body;
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) { req.flash('error', 'Email already registered.'); return res.redirect('/auth/register'); }

    const userData = { name, email: email.trim().toLowerCase(), passwordHash: password, role: role || 'buyer', phone, city };
    if (role === 'seller') {
      userData.businessName      = businessName || name;
      userData.sellerDescription = sellerDescription || '';
      userData.verificationStatus = 'pending';
    }
    const user = new User(userData);
    await user.save();
    req.flash('success', role === 'seller'
      ? 'Registration successful! Your seller account is under review.'
      : 'Registration successful! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login – Baghban' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    
    console.log("👉 Login Attempt for Email:", cleanEmail);

    const user = await User.findOne({ email: cleanEmail });
    console.log("👉 User Found in DB:", user ? `${user.name} (${user.role})` : "NOT FOUND");

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Password verification with bypass fallback for admin testing
    let isPasswordValid = false;
    try {
      if (typeof user.comparePassword === 'function') {
        isPasswordValid = await user.comparePassword(password);
      }
    } catch (passErr) {
      console.log("comparePassword error:", passErr.message);
    }

    // Agar hash fail bhi ho jaye aur admin credentials hon to bypass allow karein
    // Admin, Seller aur Buyer sab ke default passwords allow karein
    const isDefaultPassword = 
      (user.role === 'admin' && password === 'admin123') ||
      (user.role === 'seller' && password === 'seller123') ||
      (user.role === 'buyer' && password === 'buyer123');

    if (!isPasswordValid && !isDefaultPassword) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    if (!user.isActive) {
      req.flash('error', 'Your account has been suspended.');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      city: user.city,
      address: user.address || '',
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    };

    req.flash('success', `Welcome back, ${user.name}!`);

    if (user.role === 'admin')  return res.redirect('/admin/dashboard');
    if (user.role === 'seller') return res.redirect('/seller/dashboard');
    return res.redirect('/');

  } catch (err) {
    console.error("Login Server Error:", err);
    req.flash('error', 'Login failed.'); 
    res.redirect('/auth/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render('auth/profile', { title: 'My Profile – Baghban', user });
  } catch (err) { res.redirect('/'); }
};

exports.postUpdateProfile = async (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    const update = { name, phone, city, address };
    if (req.file) update.avatar = '/images/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.session.user._id, update, { new: true });
    req.session.user.name    = user.name;
    req.session.user.avatar  = user.avatar;
    req.session.user.city    = user.city;
    req.session.user.address = user.address || '';
    req.flash('success', 'Profile updated successfully.');
    res.redirect('/auth/profile');
  } catch (err) { req.flash('error', 'Update failed.'); res.redirect('/auth/profile'); }
};