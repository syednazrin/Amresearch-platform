import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// Add required parameters to MongoDB URI if not present
let uri = process.env.MONGODB_URI;

// Ensure TLS is enabled in the URI for Atlas connections
if (uri.includes('mongodb.net') || uri.includes('mongodb+srv')) {
  // Atlas connection - ensure TLS parameters are present
  if (!uri.includes('tls=') && !uri.includes('ssl=')) {
    const separator = uri.includes('?') ? '&' : '?';
    uri += separator + 'tls=true';
  }
}

const requiredParams = [
  'retryWrites=true',
  'w=majority',
];

// Check if URI has query parameters
const hasParams = uri.includes('?');
const separator = hasParams ? '&' : '?';

// Add missing parameters
requiredParams.forEach(param => {
  const paramKey = param.split('=')[0];
  if (!uri.includes(paramKey)) {
    uri += (uri.endsWith('?') || uri.endsWith('&') ? '' : separator) + param;
  }
});

console.log('📊 MongoDB Connection Attempt');
console.log('   URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('   Node Version:', process.version);
console.log('   Platform:', process.platform);

// Version to force reconnection when options change (increment to force new connection)
const CONNECTION_VERSION = 2;

const options = {
  // TLS/SSL Configuration for MongoDB Atlas
  tls: true,
  
  // Connection timeouts
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  
  // Connection pool
  maxPoolSize: 10,
  minPoolSize: 1,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // DNS resolution - force IPv4 to avoid IPv6 issues on Windows
  family: 4,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongoConnectionVersion?: number;
  };

  // Force new connection if version changed
  if (globalWithMongo._mongoConnectionVersion !== CONNECTION_VERSION) {
    // Close existing connection if any
    if (globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise.then(c => c.close()).catch(() => {});
    }
    globalWithMongo._mongoClientPromise = undefined;
    globalWithMongo._mongoConnectionVersion = CONNECTION_VERSION;
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('✅ MongoDB connected successfully (v' + CONNECTION_VERSION + ')');
        console.log('   Database:', 'aminvest');
        return client;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed');
        console.error('   Error:', error.name);
        console.error('   Message:', error.message);
        if (error.cause) {
          console.error('   Cause:', error.cause.code || error.cause.message);
        }
        console.error('');
        console.error('💡 Troubleshooting tips:');
        console.error('   1. Check your MongoDB URI in .env.local');
        console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas');
        console.error('   3. Verify your MongoDB username/password');
        console.error('   4. Try restarting your dev server');
        // Clear the cached promise so next request tries again
        globalWithMongo._mongoClientPromise = undefined;
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to get the database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('aminvest');
}

// Helper function to get a collection
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
