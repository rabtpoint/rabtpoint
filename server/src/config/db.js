import dns from 'node:dns';
import mongoose from 'mongoose';

export const connectDb = async () => {
  const uris = [process.env.MONGO_URI, process.env.MONGO_URI_STANDARD].filter(Boolean);

  if (!uris.length) {
    throw new Error('MONGO_URI is missing in server/.env');
  }

  // Some Windows networks fail Node's default DNS for mongodb+srv (querySrv ECONNREFUSED).
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');

  let lastError;

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000,
        family: 4
      });
      console.log(`MongoDB connected (${uri.startsWith('mongodb+srv') ? 'Atlas SRV' : 'standard URI'})`);
      return;
    } catch (error) {
      lastError = error;
      const label = uri.startsWith('mongodb+srv') ? 'MONGO_URI (SRV)' : 'MONGO_URI_STANDARD';
      console.warn(`MongoDB attempt failed [${label}]:`, error.message);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
    }
  }

  console.error('\nMongoDB connection failed for all configured URIs.');
  console.error('- Check server/.env MONGO_URI credentials');
  console.error('- MongoDB Atlas → Network Access → allow your IP (or 0.0.0.0/0 for dev)');
  console.error('- If SRV DNS fails, add MONGO_URI_STANDARD with mongodb:// (non-SRV) connection string\n');
  throw lastError;
};
