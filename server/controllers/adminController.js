const User = require('../models/User');
const Meal = require('../models/Meal');
const Water = require('../models/Water');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error retrieving users list', error: error.message });
  }
};

// @desc    Get all meals (Admin only)
// @route   GET /api/admin/meals
// @access  Private/Admin
const getAllMeals = async (req, res) => {
  try {
    // Populate user info (name, email) in each meal
    const meals = await Meal.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    console.error('Admin get meals error:', error);
    res.status(500).json({ message: 'Server error retrieving meals list', error: error.message });
  }
};

// @desc    Delete any meal (Admin only)
// @route   DELETE /api/admin/meals/:id
// @access  Private/Admin
const deleteFakeMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    await meal.deleteOne();
    res.json({ message: 'Meal entry successfully deleted by admin', id: req.params.id });
  } catch (error) {
    console.error('Admin delete meal error:', error);
    res.status(500).json({ message: 'Server error deleting meal entry', error: error.message });
  }
};

// @desc    Get admin dashboard metrics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalMeals = await Meal.countDocuments({});
    const totalWaterLogs = await Water.countDocuments({});

    // Group meals by type to see distribution
    const mealDistribution = await Meal.aggregate([
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
          avgCalories: { $avg: '$calories' },
        },
      },
    ]);

    // Calculate system macros total
    const macros = await Meal.aggregate([
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' },
        },
      },
    ]);

    const systemMacros = macros.length > 0 ? macros[0] : { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };

    res.json({
      totalUsers,
      totalMeals,
      totalWaterLogs,
      mealDistribution,
      systemMacros,
    });
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ message: 'Server error compiling dashboard metrics', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllMeals,
  deleteFakeMeal,
  getAdminStats,
};
