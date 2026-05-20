require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const mealRoutes = require('./routes/meals');
const waterRoutes = require('./routes/water');
const barcodeRoutes = require('./routes/barcode');
const adminRoutes = require('./routes/admin');

// Initialize app
const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing/development
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support base64 images upload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check / Home Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Nutrition Tracker Server is running smoothly',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server executing in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database connection. Server starting anyway for offline client support.', err);
  app.listen(PORT, () => {
    console.log(`Server starting on port ${PORT} without active database connection.`);
  });
});
