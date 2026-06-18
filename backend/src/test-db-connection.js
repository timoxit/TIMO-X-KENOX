const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in your environment or .env file!');
    process.exit(1);
  }

  console.log('Testing MongoDB connection...');
  console.log(`URI: ${uri.replace(/:([^@]+)@/, ':****@')}`);
  
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    await mongoose.disconnect();
    console.log('SUCCESS: Database connection verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error(`FAILED to connect to database: ${err.message}`);
    process.exit(1);
  }
}

testConnection();

