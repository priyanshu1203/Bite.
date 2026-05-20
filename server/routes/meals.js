const express = require('express');
const router = express.Router();
const { addMeal, getTodayMeals, getMealHistory, deleteMeal, syncMeals } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/add', protect, upload.single('image'), addMeal);
router.get('/today', protect, getTodayMeals);
router.get('/history', protect, getMealHistory);
router.delete('/:id', protect, deleteMeal);
router.post('/sync', protect, syncMeals);

module.exports = router;
