const mongoose = require('mongoose');
const ModerationLog = require('./models/ModerationLog');

const memoryLogs = new Map();

/**
 * Logs a moderation action. Saves to DB if connected, otherwise saves to local in-memory store.
 * @param {string} guildId 
 * @param {object} actionData 
 */
async function logModerationAction(guildId, actionData) {
  const logData = {
    guildId,
    actionType: actionData.actionType,
    moderator: actionData.moderator,
    target: actionData.target,
    details: actionData.details || '',
    timestamp: actionData.timestamp || new Date()
  };

  let savedLog = null;

  if (mongoose.connection.readyState === 1) {
    try {
      savedLog = await ModerationLog.create(logData);
    } catch (e) {
      console.warn(`[LogManager] MongoDB log save failed: ${e.message}. Saving in memory.`);
    }
  }

  // If not saved to DB, create a mock document structure with a unique ID
  if (!savedLog) {
    savedLog = {
      _id: `mock-log-${Date.now()}-${Math.round(Math.random() * 1000000)}`,
      ...logData
    };
  }

  // Cache in memory (keep latest 100 logs)
  if (!memoryLogs.has(guildId)) {
    memoryLogs.set(guildId, []);
  }
  const guildLogs = memoryLogs.get(guildId);
  guildLogs.unshift(savedLog);
  if (guildLogs.length > 100) {
    guildLogs.pop();
  }

  return savedLog;
}

/**
 * Gets moderation logs for a guild. Fetches from DB if connected, otherwise falls back to local memory.
 * @param {string} guildId 
 */
async function getModerationLogs(guildId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbLogs = await ModerationLog.find({ guildId })
        .sort({ timestamp: -1 })
        .limit(100)
        .maxTimeMS(2500);
      
      // Keep memory cache updated
      memoryLogs.set(guildId, dbLogs);
      return dbLogs;
    } catch (e) {
      console.warn(`[LogManager] MongoDB query failed: ${e.message}. Using in-memory logs.`);
    }
  }

  if (!memoryLogs.has(guildId)) {
    memoryLogs.set(guildId, []);
  }
  return memoryLogs.get(guildId);
}

module.exports = { logModerationAction, getModerationLogs };
