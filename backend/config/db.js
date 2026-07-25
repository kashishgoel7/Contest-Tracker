/**
 * Database Configuration
 * This file establishes a connection to MongoDB using Mongoose.
 * Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js.
 * It manages relationships between data, provides schema validation, and translates between objects in code and database representations.
 */

const mongoose = require('mongoose');

// An asynchronous function to connect to our MongoDB instance.
// Using async/await allows us to handle promises cleanly and write code that reads synchronously.
const connectDB = async () => {
  try {
    // Read the database connection string from environment variables (.env file)
    const connUri = process.env.MONGODB_URI;

    // Check if the URI is configured
    if (!connUri || connUri === 'your_mongodb_atlas_connection_string_here') {
      console.error('ERROR: MONGODB_URI is not set in the .env file!');
      process.exit(1); // Exit process with failure code
    }

    // Connect to MongoDB.
    // mongoose.connect returns a promise. By using 'await', we block execution of this function 
    // until the promise is either resolved (successful connection) or rejected (connection error).
    const conn = await mongoose.connect(connUri);

    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    // If the promise was rejected or another error occurred during connection, catch it here.
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Terminate the server with error status 1
  }
};

module.exports = connectDB;
