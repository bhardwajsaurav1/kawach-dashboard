const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kavach';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
    console.log('MongoDB connected successfully:', uri);
  } catch (err) {
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
      console.log('In-Memory MongoDB connected at:', mongoUri);

      const seedData = require('../seed');
      console.log('Auto-seeding database...');
      await seedData();
      console.log('Database auto-seeded successfully!');
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB server:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
