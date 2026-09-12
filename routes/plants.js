const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/plantController');
router.get('/', ctrl.browsePlants);
router.get('/:id', ctrl.getPlantDetail);
module.exports = router;
