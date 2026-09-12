const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reviewController');
const { isLoggedIn } = require('../middleware/auth');
router.post('/submit', isLoggedIn, ctrl.submitReview);
router.get('/seller/:sellerId', ctrl.getSellerReviews);
module.exports = router;
