const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsaathi';

  try {
    // Set a 3 second timeout for initial connection attempt so it doesn't hang
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${mongoose.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] MongoDB connection failed (${error.message}).`);
    console.warn('[Database Fallback] Operating in graceful in-memory memory store mode for local demo.');
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  mode: isConnected ? 'mongodb' : 'in-memory-fallback'
});

module.exports = { connectDB, getDBStatus };
