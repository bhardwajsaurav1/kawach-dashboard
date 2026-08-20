const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      console.log('MongoDB connected successfully:', uri);
      return;
    } catch (err) {
      console.error('MongoDB URI connection failed:', err.message);
    }
  }

  // Try local MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/kavach', { serverSelectionTimeoutMS: 1500 });
    isConnected = true;
    console.log('Local MongoDB connected');
    return;
  } catch (err) {
    // If running in Vercel serverless environment without MONGO_URI, return gracefully
    if (process.env.VERCEL) {
      console.log('Running in Vercel serverless environment without active MONGO_URI.');
      return;
    }

    console.log('Local MongoDB connection unavailable. Initializing In-Memory MongoDB Server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const systemBinaryPath = path.resolve(__dirname, '../../../mongo_bin/mongodb-win32-x86_64-windows-4.4.29/bin/mongod.exe');

      const serverOpts = {};
      if (fs.existsSync(systemBinaryPath)) {
        console.log('Using pre-extracted mongod binary at:', systemBinaryPath);
        serverOpts.binary = { systemBinary: systemBinaryPath };
      } else {
        serverOpts.binary = { version: '4.4.29' };
      }

      const mongoServer = await MongoMemoryServer.create(serverOpts);
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      isConnected = true;
      console.log('In-Memory MongoDB connected at:', mongoUri);

      const seedData = require('../seed');
      console.log('Auto-seeding database...');
      await seedData();
      console.log('Database auto-seeded successfully!');
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB server:', memErr.message);
    }
  }
};

module.exports = connectDB;
