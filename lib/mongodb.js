import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailureAt: 0 };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from environment variables.");
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  // Avoid hammering DNS/connect on every request when DB is down.
  if (!cached.promise && cached.lastFailureAt && Date.now() - cached.lastFailureAt < 30000) {
    throw new Error('MongoDB temporarily unavailable. Retrying soon.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('=> Initializing new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('=> MongoDB Connected Successfully');
      cached.lastFailureAt = 0;
      return mongoose;
    }).catch(err => {
      console.error('=> MongoDB Connection Error:', err);
      cached.lastFailureAt = Date.now();
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
