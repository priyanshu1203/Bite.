const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);

module.exports = router;
