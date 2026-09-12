// Middleware to check if user is logged in
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Please login to continue.');
  res.redirect('/auth/login');
};

// Middleware to check role
exports.isBuyer = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'buyer') return next();
  req.flash('error', 'Access denied.');
  res.redirect('/');
};

exports.isSeller = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'seller') return next();
  req.flash('error', 'Access denied. Seller account required.');
  res.redirect('/');
};

exports.isVerifiedSeller = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'seller' && req.session.user.isVerified) return next();
  req.flash('error', 'Your seller account is not yet verified.');
  res.redirect('/seller/dashboard');
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Admin access required.');
  res.redirect('/');
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.session.user) return next();
  res.redirect('/');
};
