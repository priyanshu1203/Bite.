require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

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
