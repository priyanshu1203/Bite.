const express = require('express');
const router = express.Router();
const { getAllUsers, getAllMeals, deleteFakeMeal, getAdminStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/users', protect, admin, getAllUsers);
router.get('/meals', protect, admin, getAllMeals);
router.delete('/meals/:id', protect, admin, deleteFakeMeal);
router.get('/stats', protect, admin, getAdminStats);

module.exports = router;
