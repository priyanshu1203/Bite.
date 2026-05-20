const Water = require('../models/Water');

// @desc    Add water intake
// @route   POST /api/water/add
// @access  Private
const addWater = async (req, res) => {
  try {
    const { amount, date } = req.body; // date as YYYY-MM-DD
    
    if (!amount || !date) {
      return res.status(400).json({ message: 'Amount and date are required' });
    }

    const waterLog = await Water.create({
      userId: req.user._id,
      amount: Number(amount),
      date,
    });

    res.status(201).json(waterLog);
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({ message: 'Server error adding water entry', error: error.message });
  }
};

// @desc    Get water total for a date
// @route   GET /api/water/today
// @access  Private
const getTodayWater = async (req, res) => {
  try {
    const { date } = req.query; // date as YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const logs = await Water.find({
      userId: req.user._id,
      date,
    });

    const total = logs.reduce((sum, log) => sum + log.amount, 0);

    res.json({ total, logs });
  } catch (error) {
    console.error('Get water error:', error);
    res.status(500).json({ message: 'Server error retrieving water stats', error: error.message });
  }
};

// @desc    Sync offline water entries
// @route   POST /api/water/sync
// @access  Private
const syncWater = async (req, res) => {
  try {
    const { waterLogs } = req.body;

    if (!waterLogs || !Array.isArray(waterLogs) || waterLogs.length === 0) {
      return res.status(400).json({ message: 'Invalid offline water logs sync payload' });
    }

    const logsToInsert = waterLogs.map((log) => ({
      userId: req.user._id,
      amount: Number(log.amount),
      date: log.date,
      createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
    }));

    const insertedLogs = await Water.insertMany(logsToInsert);
    res.status(201).json({ message: 'Water logs synced successfully', count: insertedLogs.length });
  } catch (error) {
    console.error('Sync water error:', error);
    res.status(500).json({ message: 'Server error syncing water logs', error: error.message });
  }
};

module.exports = {
  addWater,
  getTodayWater,
  syncWater,
};
