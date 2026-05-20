const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: [true, 'Meal type is required'],
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbohydrates cannot be negative'],
    },
    fats: {
      type: Number,
      default: 0,
      min: [0, 'Fats cannot be negative'],
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative'],
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative'],
    },
    image: {
      type: String, // Cloudinary URL or Base64 string
      default: '',
    },
    barcode: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Meal', mealSchema);
