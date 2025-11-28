const mongoose = require('mongoose');
require('dotenv').config(); // make sure dotenv is called once at app start

const connectDB = async () => {
  try {
    // Select correct URI depending on environment
    const mongoUri = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MongoDB URI not set in environment variables!');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
