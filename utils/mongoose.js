const mongoose = require('mongoose');

const { MONGO_URI, MONGODB_DB } = process.env;

if (!MONGO_URI) throw new Error('MONGO_URI is not defined.');
if (!MONGODB_DB) throw new Error('MONGODB_DB is not defined.');

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null };

module.exports = {
  connectMongo: async () => {
    console.log('Connecting to MongoDB...');
    if (cached.conn) return cached.conn;

    console.log('Creating new MongoDB connection...');
    const completUri = `${MONGO_URI}/${MONGODB_DB}?retryWrites=true&w=majority`;
    cached.conn = await mongoose.connect(completUri);

    console.log('MongoDB connection established.');
    return cached.conn;
  }
}