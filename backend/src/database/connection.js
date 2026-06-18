const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Warning: ${error.message}`);
    console.log('[Database] App will run in offline mode. Please verify MONGODB_URI and internet connection.');
  }
};

module.exports = connectDB;
