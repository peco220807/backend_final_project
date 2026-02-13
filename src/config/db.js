const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'desirestore';
  if (!uri) throw new Error('MONGODB_URI is missing');

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, { dbName });
  return mongoose.connection;
}

module.exports = { connectDB };
