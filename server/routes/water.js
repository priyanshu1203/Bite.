const express = require('express');
const router = express.Router();
const { addWater, getTodayWater, syncWater } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, addWater);
router.get('/today', protect, getTodayWater);
router.post('/sync', protect, syncWater);

module.exports = router;
