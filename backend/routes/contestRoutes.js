/**
 * Contest Routes Configuration
 * This file maps URL endpoints to controller actions.
 * Router groups related routes together to keep server.js clean and modular.
 */

const express = require('express');
const router = express.Router();

// Import our contest controller which contains the endpoint handlers
const contestController = require('../controllers/contestController');

/**
 * Route: GET /api/contests
 * Description: Retrieves all upcoming contests stored in the database, sorted by start date.
 * Access: Public
 */
router.get('/', contestController.getContests);

/**
 * Route: POST /api/contests/sync
 * Description: Manually triggers codeforces API fetch & sync with database.
 * Access: Public (can be protected in production, but public for our demo/testing)
 */
router.post('/sync', contestController.fetchAndSyncContests);

module.exports = router;
