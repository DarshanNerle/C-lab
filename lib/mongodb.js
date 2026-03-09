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

const isSrvClusterUri = (uri = '') => uri.startsWith('mongodb+srv://');

const getConnectionErrorHint = (uri, message) => {
  const msg = String(message || '').toLowerCase();
  if (!uri) return 'Missing MONGODB_URI in environment.';
  if (uri.includes('cluster.mongodb.net') && (uri.includes('@cluster.mongodb.net') || !uri.includes('@'))) {
    return 'MONGODB_URI looks like a placeholder. Set full Atlas URI with username/password and your actual cluster ID.';
  }
  if (msg.includes('querysrv econnrefused') || msg.includes('enotfound') || msg.includes('eai_again')) {
    return 'DNS/network issue while resolving MongoDB SRV record. Check internet/VPN/firewall and Atlas host allowlist.';
  }
  if (msg.includes('authentication failed')) {
    return 'MongoDB authentication failed. Verify username/password in MONGODB_URI.';
  }
  if (msg.includes('server selection timed out')) {
    return 'MongoDB server selection timeout. Verify URI, cluster status, and network access.';
  }
  return 'Unable to connect to MongoDB. Using fallback storage mode where available.';
};

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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      family: 4
    };

    let retryCount = 0;
    const connectWithRetry = async () => {
      try {
        console.log(`=> Initializing new MongoDB connection... (Attempt ${retryCount + 1})`);
        if (isSrvClusterUri(MONGODB_URI) && !MONGODB_URI.includes('@')) {
          throw new Error('Invalid MongoDB Atlas URI format');
        }
        const connection = await mongoose.connect(MONGODB_URI, opts);
        console.log('=> MongoDB Connected Successfully');
        cached.lastFailureAt = 0;
        return connection;
      } catch (err) {
        const hint = getConnectionErrorHint(MONGODB_URI, err?.message);
        console.error('=> MongoDB Connection Error:', err.message);
        console.error('=> MongoDB Hint:', hint);
        if (retryCount < 2) {
            retryCount++;
            console.log(`=> Retrying MongoDB connection in 1 second...`);
            await new Promise(res => setTimeout(res, 1000));
            return connectWithRetry();
        }
        cached.lastFailureAt = Date.now();
        const enhanced = new Error(`MongoDB connection failed: ${err?.message || 'Unknown error'}. ${hint}`);
        enhanced.cause = err;
        throw enhanced;
      }
    };
    
    cached.promise = connectWithRetry().catch(err => {
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
