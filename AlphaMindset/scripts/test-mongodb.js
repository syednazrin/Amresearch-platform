const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

console.log('=== MongoDB Connection Test ===\n');
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('MongoDB Driver:', require('mongodb/package.json').version);
console.log('');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

let uri = process.env.MONGODB_URI;

// Ensure TLS is enabled
if (!uri.includes('tls=') && !uri.includes('ssl=')) {
  const separator = uri.includes('?') ? '&' : '?';
  uri += separator + 'tls=true';
}

console.log('URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('');

const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  family: 4, // Force IPv4
  serverSelectionTimeoutMS: 10000,
};

console.log('Attempting connection...\n');

const client = new MongoClient(uri, options);

client.connect()
  .then(async (client) => {
    console.log('✅ Connection successful!');
    
    // Test database access
    const db = client.db('aminvest');
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database: aminvest');
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');
    
    await client.close();
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed\n');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.cause) {
      console.error('\nUnderlying Cause:');
      console.error('  Code:', error.cause.code);
      console.error('  Reason:', error.cause.reason || error.cause.message);
    }
    
    console.error('\n💡 Possible Solutions:');
    
    if (error.message.includes('tlsv1 alert internal error')) {
      console.error('  1. This is a TLS handshake error');
      console.error('  2. Check if your MongoDB Atlas IP whitelist includes your current IP');
      console.error('  3. Try temporarily allowing 0.0.0.0/0 in Atlas Network Access');
      console.error('  4. Verify your MongoDB credentials are correct');
      console.error('  5. Check if Windows Firewall or Antivirus is blocking the connection');
      console.error('  6. Try using a VPN or different network');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('  1. Check your internet connection');
      console.error('  2. Verify the MongoDB URI is correct');
      console.error('  3. Try flushing DNS: ipconfig /flushdns');
    }
    
    process.exit(1);
  });
