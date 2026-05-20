const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/ai_nutrition_tracker';

  const connect = async (uri) => {
    const conn = await mongoose.connect(uri, {
      dbName: 'ai_nutrition_tracker',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  };

  try {
    return await connect(primaryUri || fallbackUri);
  } catch (primaryError) {
    if (primaryUri) {
      console.error(`Primary MongoDB Connection Error: ${primaryError.message}`);
      console.log(`Retrying with local fallback MongoDB: ${fallbackUri}`);
      try {
        return await connect(fallbackUri);
      } catch (fallbackError) {
        console.error(`Fallback MongoDB Connection Error: ${fallbackError.message}`);
        console.log('Backend running in local/fallback support mode due to database connection issue.');
        throw fallbackError;
      }
    }

    console.error(`MongoDB Connection Error: ${primaryError.message}`);
    console.log('Backend running in local/fallback support mode due to database connection issue.');
    throw primaryError;
  }
};

module.exports = connectDB;
