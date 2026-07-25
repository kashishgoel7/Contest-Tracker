/**
 * Cron Service
 * This file schedules automated background tasks using the 'node-cron' library.
 * Node-cron allows us to schedule tasks in Node.js using full crontab syntax.
 *
 * How CRON expressions work:
 * A cron expression is a string consisting of 5 or 6 fields separated by spaces:
 *
 *  ┌────────────── minute (0 - 59)
 *  │ ┌──────────── hour (0 - 23)
 *  │ │ ┌────────── day of month (1 - 31)
 *  │ │ │ ┌──────── month (1 - 12)
 *  │ │ │ │ ┌────── day of week (0 - 6) (0 is Sunday, or names)
 *  │ │ │ │ │
 *  * * * * *
 *
 * Examples:
 * - '* * * * *'      = Runs every single minute.
 * - '*` + `/15  * * * *'   = Runs every 15 minutes.
 * - '0 * * * *'      = Runs at the start of every hour (e.g. 1:00, 2:00).
 * - '0 0 * * *'      = Runs exactly at midnight (00:00) every day.
 * - '0 12 * * 1'     = Runs at 12:00 PM (noon) every Monday.
 */

const cron = require("node-cron");
const contestController = require("../controllers/contestController");

// Initialize and schedule the cron jobs
const initCronJobs = () => {
  console.log("Registering scheduled background tasks...");

  // Schedule Codeforces Sync: Run once a day at midnight ('0 0 * * *')
  // For development testing, we can explain how to change this schedule.
  // cron.schedule returns a ScheduledTask object which we can start/stop.
  const codeforcesSyncJob = cron.schedule("0 0 * * *", async () => {
    console.log("[Cron Job] Executing scheduled daily Codeforces sync...");
    try {
      // Execute the sync logic directly.
      // Since it's run internally by the server's cron engine, we don't pass 'res' (response) object.
      await contestController.fetchAndSyncContests(null, null);
      console.log(
        "[Cron Job] Scheduled daily Codeforces sync completed successfully.",
      );
    } catch (error) {
      console.error(
        `[Cron Job Error] Failed executing daily sync: ${error.message}`,
      );
    }
  });

  // Start the task immediately. (It runs in the background as long as the server is running)
  codeforcesSyncJob.start();

  console.log(
    "Daily Codeforces sync job scheduled for midnight (00:00) daily.",
  );
};

module.exports = { initCronJobs };
