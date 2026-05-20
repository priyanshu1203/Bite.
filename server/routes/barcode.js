const express = require('express');
const router = express.Router();
const { lookupNutrition } = require('../controllers/barcodeController');
const { protect } = require('../middleware/auth');

router.post('/scan', protect, lookupNutrition);

module.exports = router;
