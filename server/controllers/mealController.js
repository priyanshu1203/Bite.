const Meal = require('../models/Meal');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Add a single meal
// @route   POST /api/meals/add
// @access  Private
const addMeal = async (req, res) => {
  try {
    const {
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fats,
      sugar,
      fiber,
      barcode,
      createdAt, // Optional date for offline sync backdating
    } = req.body;

    let imageUrl = '';

    // If file uploaded through multer
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      } catch (err) {
        console.error('Image upload failed, continuing without image:', err);
      }
    } else if (req.body.image) {
      // If client sent a base64 or url string directly
      imageUrl = req.body.image;
    }

    const mealData = {
      userId: req.user._id,
      mealType,
      foodName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      sugar: Number(sugar) || 0,
      fiber: Number(fiber) || 0,
      image: imageUrl,
      barcode: barcode || '',
    };

    // If backdating from offline sync
    if (createdAt) {
      mealData.createdAt = new Date(createdAt);
    }

    const meal = await Meal.create(mealData);
    res.status(201).json(meal);
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ message: 'Server error adding meal', error: error.message });
  }
};

// @desc    Get today's meals
// @route   GET /api/meals/today
// @access  Private
const getTodayMeals = async (req, res) => {
  try {
    // Determine start and end of "today" in local context
    // We can accept a client-side timezone offset, or default to the server's calendar day
    const timezoneOffset = req.query.timezoneOffset ? Number(req.query.timezoneOffset) : 0;
    
    const now = new Date();
    // Adjust server time to match client timezone
    const clientNow = new Date(now.getTime() - (timezoneOffset * 60 * 1000));
    
    const startOfDay = new Date(clientNow);
    startOfDay.setHours(0, 0, 0, 0);
    // Shift back to UTC/Server time for query
    const utcStart = new Date(startOfDay.getTime() + (timezoneOffset * 60 * 1000));
    
    const endOfDay = new Date(clientNow);
    endOfDay.setHours(23, 59, 59, 999);
    // Shift back to UTC/Server time for query
    const utcEnd = new Date(endOfDay.getTime() + (timezoneOffset * 60 * 1000));

    const meals = await Meal.find({
      userId: req.user._id,
      createdAt: {
        $gte: utcStart,
        $lte: utcEnd,
      },
    }).sort({ createdAt: -1 });

    res.json(meals);
  } catch (error) {
    console.error('Get today meals error:', error);
    res.status(500).json({ message: 'Server error retrieving today\'s meals', error: error.message });
  }
};

// @desc    Get meal history with filters
// @route   GET /api/meals/history
// @access  Private
const getMealHistory = async (req, res) => {
  try {
    const { startDate, endDate, mealType, search } = req.query;
    const query = { userId: req.user._id };

    // Date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include full end day
        query.createdAt.$lte = end;
      }
    }

    // Meal type filtering
    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    // Keyword search
    if (search) {
      query.foodName = { $regex: search, $options: 'i' };
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    console.error('Get meal history error:', error);
    res.status(500).json({ message: 'Server error retrieving history', error: error.message });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: 'Meal entry not found' });
    }

    // Check ownership
    if (meal.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this meal' });
    }

    await meal.deleteOne();
    res.json({ message: 'Meal entry removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error deleting meal', error: error.message });
  }
};

// @desc    Sync multiple meals from offline mode
// @route   POST /api/meals/sync
// @access  Private
const syncMeals = async (req, res) => {
  try {
    const { meals } = req.body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ message: 'Invalid offline sync payload' });
    }

    const mealsToInsert = meals.map((meal) => ({
      userId: req.user._id,
      mealType: meal.mealType,
      foodName: meal.foodName,
      calories: Number(meal.calories),
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fats: Number(meal.fats) || 0,
      sugar: Number(meal.sugar) || 0,
      fiber: Number(meal.fiber) || 0,
      image: meal.image || '',
      barcode: meal.barcode || '',
      createdAt: meal.createdAt ? new Date(meal.createdAt) : new Date(),
    }));

    const insertedMeals = await Meal.insertMany(mealsToInsert);
    res.status(201).json({ message: 'Meals synced successfully', count: insertedMeals.length, meals: insertedMeals });
  } catch (error) {
    console.error('Sync meals error:', error);
    res.status(500).json({ message: 'Server error syncing meals', error: error.message });
  }
};

module.exports = {
  addMeal,
  getTodayMeals,
  getMealHistory,
  deleteMeal,
  syncMeals,
};
