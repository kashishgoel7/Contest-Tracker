/**
 * Contest Controller
 * This file contains the logic for processing request routes related to contests.
 * It interfaces with our Mongoose 'Contest' model to query the database,
 * and uses Axios to fetch live data from the external Codeforces API.
 */

const axios = require('axios');
const Contest = require('../models/Contest');

/**
 * Helper function to transform external Codeforces API format into our Mongoose schema format.
 * Beginner Tip: Codeforces uses Unix timestamps (seconds since epoch) while JavaScript uses
 * Date objects. We convert it by multiplying by 1000 (seconds -> milliseconds) and passing it to new Date().
 */
const transformCodeforcesContest = (cfContest) => {
  return {
    externalId: String(cfContest.id),
    name: cfContest.name,
    platform: 'Codeforces',
    // Convert Unix timestamp in seconds to standard JS Date object
    startTime: new Date(cfContest.startTimeSeconds * 1000),
    durationSeconds: cfContest.durationSeconds,
    // Construct the public URL for the contest using the contest ID
    url: `https://codeforces.com/contest/${cfContest.id}`,
    phase: cfContest.phase
  };
};

/**
 * Controller Action: Get Contests
 * Retrieves upcoming contests from the database and returns them to the client.
 * Route: GET /api/contests
 */
exports.getContests = async (req, res) => {
  try {
    // 1. Check if client requested all contests (including finished) or only upcoming ones
    const query = {};
    if (req.query.all !== 'true') {
      query.phase = 'BEFORE'; // default behavior is only upcoming
    }

    // 2. Fetch contests from database sorted by 'startTime' ascending (soonest first)
    const contests = await Contest.find(query)
      .sort({ startTime: 1 });

    // Send a HTTP 200 (OK) response containing the list of contests in JSON format
    return res.status(200).json({
      success: true,
      count: contests.length,
      data: contests
    });
  } catch (error) {
    // Log backend error and return HTTP 500 (Internal Server Error)
    console.error(`Error in getContests: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contests from database',
      error: error.message
    });
  }
};

/**
 * Controller Action/Service: Fetch and Sync Contests
 * Fetches the latest contests list from the Codeforces API, processes/filters them,
 * and upserts (updates if existing, inserts if new) them into MongoDB.
 * Route: POST /api/contests/sync (can be called manually or automatically via cron job)
 */
exports.fetchAndSyncContests = async (req, res) => {
  try {
    console.log('Initiating sync with Codeforces API...');

    // 1. Fetch data from Codeforces public API
    // axios.get returns a Promise. 'await' suspends execution here until the network request completes.
    const response = await axios.get('https://codeforces.com/api/contest.list');

    // 2. Validate response structure from external API
    if (!response.data || response.data.status !== 'OK') {
      throw new Error('Invalid response status received from Codeforces API');
    }

    const allContests = response.data.result;

    // 3. Filter contests: We only want upcoming contests (phase == 'BEFORE')
    // Array.prototype.filter creates a new array containing only elements that pass the test
    const upcomingContests = allContests.filter(contest => contest.phase === 'BEFORE');

    console.log(`Fetched ${allContests.length} total contests; found ${upcomingContests.length} upcoming contests.`);

    // 4. Save/Update records in MongoDB
    // To prevent duplicate database records, we use an "upsert" (update or insert) strategy.
    // We look up each contest by its 'externalId'. If found, we update it; if not, we insert it.
    let syncCount = 0;
    
    for (const contestData of upcomingContests) {
      // Transform external data format to our application schema
      const formattedContest = transformCodeforcesContest(contestData);

      // findOneAndUpdate:
      // - Argument 1: Query filter to find the record (externalId: ...)
      // - Argument 2: New data to save (formattedContest)
      // - Argument 3: Options:
      //     - upsert: true -> creates document if it does not exist
      //     - new: true -> returns the updated document rather than the old one
      //     - setDefaultsOnInsert: true -> applies schema defaults if a new doc is inserted
      await Contest.findOneAndUpdate(
        { externalId: formattedContest.externalId },
        formattedContest,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      syncCount++;
    }

    // Optional optimization: also update phase of existing DB contests that have now started (no longer in phase "BEFORE")
    // If a contest is in our database as 'BEFORE', but was NOT in the 'upcomingContests' list from Codeforces,
    // it has likely started. Let's update those to 'CODING' or 'FINISHED' so they don't stay in the upcoming view.
    const upcomingIds = upcomingContests.map(c => String(c.id));
    
    // Set all contests in DB whose externalId is NOT in the new upcoming list and phase is 'BEFORE' to 'FINISHED' 
    // or just delete them/update their status. Let's update their phase to 'FINISHED' so they filter out of the upcoming view.
    await Contest.updateMany(
      { externalId: { $nin: upcomingIds }, phase: 'BEFORE' },
      { $set: { phase: 'FINISHED' } }
    );

    console.log(`Sync completed successfully. Synced ${syncCount} upcoming contests.`);

    // If this function was called as an Express API route handler, send response to client.
    // Note: When called by the cron job, 'res' will be null or undefined.
    if (res) {
      return res.status(200).json({
        success: true,
        message: `Successfully synchronized ${syncCount} upcoming contests with MongoDB.`,
        syncedCount: syncCount
      });
    }
  } catch (error) {
    console.error(`Error in fetchAndSyncContests: ${error.message}`);
    if (res) {
      return res.status(500).json({
        success: false,
        message: 'Failed to synchronize contests with database',
        error: error.message
      });
    }
    // Propagate error up to scheduler if called by cron job
    throw error;
  }
};
