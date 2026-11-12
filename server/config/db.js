const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeplanner';
    const useMemory = process.env.USE_MEMORY_DB === 'true';

    if (useMemory) {
      console.log('⚡ Initializing MongoMemoryServer (USE_MEMORY_DB=true)...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    try {
      // Attempt connection with short timeout so it fails fast if local mongod is not running
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (primaryError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ Could not connect to primary MongoDB at ${mongoUri} (${primaryError.message}).`);
        console.log('⚡ Falling back to embedded MongoMemoryServer for development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback In-Memory MongoDB Connected: ${fallbackUri}`);
        return conn;
      }
      throw primaryError;
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, disconnectDB };
