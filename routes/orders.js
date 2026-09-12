const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/orderController');
const { isLoggedIn } = require('../middleware/auth');
router.post('/place', isLoggedIn, ctrl.placeOrder);
router.get('/', isLoggedIn, ctrl.getMyOrders);
router.get('/:id', isLoggedIn, ctrl.getOrderDetail);
router.post('/:id/cancel', isLoggedIn, ctrl.cancelOrder);
module.exports = router;
