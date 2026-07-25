/**
 * Express Server Entry Point
 * This is the main file that boots up our backend application.
 * It configures environment variables, establishes database connections,
 * initializes middleware (like CORS), mounts API routes, and starts the server.
 */

// 1. Load environment variables from .env file into process.env
// Must be loaded before importing other files that rely on these variables!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const contestRoutes = require('./routes/contestRoutes');
const { initCronJobs } = require('./services/cronService');

// Initialize the Express application
const app = express();

// Set the port from environment variables, fallback to 5000 if not defined
const PORT = process.env.PORT || 5000;

// 2. Connect to MongoDB Atlas
connectDB();

// 3. Configure Middleware
// CORS (Cross-Origin Resource Sharing):
// Express servers block requests from different domains by default. Since our React
// frontend runs on a different port (e.g. 5173), we must allow cross-origin requests
// so the frontend can retrieve the contest data.
app.use(cors({
  origin: '*', // For development, allow any client to access. Can restrict in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser: allows Express to parse incoming requests with JSON payloads (e.g., in POST requests)
app.use(express.json());

// 4. Mount API Routes
// Any request starting with /api/contests will be directed to contestRoutes.js
app.use('/api/contests', contestRoutes);

// Simple health check route to verify the server is running
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Contest Calendar Server is active and healthy.' });
});

// 5. Initialize Cron Jobs
// Starts background scheduler for fetching contests once a day
initCronJobs();

// 6. Start the Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Server is running on port: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check endpoint: http://localhost:${PORT}/health`);
  console.log(` API contests list endpoint: http://localhost:${PORT}/api/contests`);
  console.log(`===================================================`);
});
