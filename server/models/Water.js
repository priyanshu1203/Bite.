const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number, // in ml
      required: [true, 'Water volume is required'],
      min: [0, 'Water volume cannot be negative'],
    },
    date: {
      type: String, // Format YYYY-MM-DD
      required: [true, 'Date string is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so query by userId and date is fast
waterSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Water', waterSchema);
