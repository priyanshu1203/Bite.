const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, weight, height, fitnessGoal, calorieGoal } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Default calorie goal if none provided
    // Quick estimation formula: BMR + Activity multiplier
    // A simple default calculated or standard 2000
    let finalCalorieGoal = calorieGoal || 2000;
    if (!calorieGoal && weight && height && age) {
      // Mifflin-St Jeor formula baseline
      const bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Assumed male default for formula baseline
      if (fitnessGoal === 'Lose Weight') finalCalorieGoal = Math.round(bmr * 1.2 - 500);
      else if (fitnessGoal === 'Gain Muscle') finalCalorieGoal = Math.round(bmr * 1.4 + 300);
      else finalCalorieGoal = Math.round(bmr * 1.2);
    }

    // If first user, make admin for testing ease
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      age: age || 25,
      weight: weight || 70,
      height: height || 170,
      fitnessGoal: fitnessGoal || 'Maintain',
      calorieGoal: finalCalorieGoal,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal,
        calorieGoal: user.calorieGoal,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal,
        calorieGoal: user.calorieGoal,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal,
        calorieGoal: user.calorieGoal,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.age = req.body.age !== undefined ? req.body.age : user.age;
      user.weight = req.body.weight !== undefined ? req.body.weight : user.weight;
      user.height = req.body.height !== undefined ? req.body.height : user.height;
      user.fitnessGoal = req.body.fitnessGoal || user.fitnessGoal;
      user.calorieGoal = req.body.calorieGoal !== undefined ? req.body.calorieGoal : user.calorieGoal;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight: updatedUser.weight,
        height: updatedUser.height,
        fitnessGoal: updatedUser.fitnessGoal,
        calorieGoal: updatedUser.calorieGoal,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
