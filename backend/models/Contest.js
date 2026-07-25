/**
 * Contest Model
 * This file defines the Mongoose schema for a contest.
 * A schema acts as a blueprint, defining the structure of the documents
 * inside a MongoDB collection (analogous to a table in relational databases).
 */

const mongoose = require('mongoose');

// Define the schema structure using the mongoose.Schema constructor.
const contestSchema = new mongoose.Schema({
  // Unique ID from the API provider (e.g., Codeforces contest ID).
  // Having a unique identifier is crucial to prevent duplicate records
  // when we periodically fetch and save contests.
  externalId: {
    type: String,
    required: true,
    unique: true, // Guarantees database-level uniqueness; indexing will speed up searches
  },
  // Name/Title of the contest (e.g., "Codeforces Round 999 (Div. 2)")
  name: {
    type: String,
    required: true, // Must be provided
    trim: true,     // Removes leading and trailing whitespace
  },
  // Platform hosting the contest (e.g., "Codeforces", "Hackerearth", etc.)
  platform: {
    type: String,
    default: 'Codeforces',
    required: true,
  },
  // Start date and time of the contest. Stored in UTC in the database,
  // which will be localized by the client's browser (React frontend).
  startTime: {
    type: Date,
    required: true,
  },
  // Duration of the contest in seconds. Let's store it as a number
  // so the frontend can calculate the end time or format it (e.g., "2 hours").
  durationSeconds: {
    type: Number,
    required: true,
  },
  // The link/URL to view or register for the contest on the hosting platform.
  url: {
    type: String,
    required: true,
  },
  // Current phase/status of the contest from the API (e.g., "BEFORE", "CODING", "FINISHED").
  // - "BEFORE": Contest has not started yet (upcoming)
  // - "CODING": Contest is active/currently running
  // - "FINISHED": Contest has completed
  phase: {
    type: String,
    required: true,
    enum: ['BEFORE', 'CODING', 'FINISHED'], // Restricts the field value to these exact strings
  }
}, {
  // Option to automatically inject `createdAt` and `updatedAt` timestamps into each document.
  timestamps: true 
});

// Compile the schema into a Model and export it.
// A Mongoose model is a wrapper around the schema that provides methods to interact
// with the database collection (like Contest.find(), Contest.create(), etc.)
module.exports = mongoose.model('Contest', contestSchema);
