const spamMap = new Map();

/**
 * Tracks message and checks if it exceeds spam threshold.
 * @param {object} message Discord message object
 * @param {number} maxMessages Max messages allowed in window
 * @param {number} timeWindow Time window in ms
 * @returns {object} Object containing isSpamming boolean and array of message objects
 */
function checkSpam(message, maxMessages, timeWindow) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const key = `${userId}-${channelId}`;
  const now = Date.now();
  
  if (!spamMap.has(key)) {
    spamMap.set(key, []);
  }
  
  const entries = spamMap.get(key);
  
  // Filter out older entries outside the timeWindow
  const validEntries = entries.filter(entry => now - entry.timestamp < timeWindow);
  validEntries.push({ timestamp: now, message });
  
  spamMap.set(key, validEntries);
  
  const isSpamming = validEntries.length > maxMessages;
  
  return {
    isSpamming,
    messages: isSpamming ? validEntries.map(entry => entry.message) : []
  };
}

/**
 * Resets spam history for a user in a channel.
 * @param {string} userId User ID
 * @param {string} channelId Channel ID
 */
function resetSpam(userId, channelId) {
  const key = `${userId}-${channelId}`;
  spamMap.delete(key);
}

module.exports = { checkSpam, resetSpam };
