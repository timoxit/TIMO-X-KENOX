const { getIo } = require('../../server/socket');

// In-memory store for active bulk nickname jobs
const activeNicknameJobs = {};
const activeNicknameIntervals = {};

/**
 * Emits progress data to client socket room for the guild
 */
function emitProgress(guildId) {
  try {
    const io = getIo();
    if (io) {
      const job = activeNicknameJobs[guildId];
      if (job) {
        io.to(`guild_${guildId}`).emit('bulk_nickname_progress', {
          status: job.status,
          total: job.total,
          current: job.current,
          success: job.success,
          fail: job.fail,
          template: job.template,
          casing: job.casing,
          sourceNameType: job.sourceNameType,
          reset: job.reset,
          logs: job.logs
        });
        console.log(`[Socket Emit] Bulk nickname progress for guild ${guildId}:`, {
          status: job.status,
          current: job.current,
          total: job.total,
          logCount: job.logs.length
        });
      }
    }
  } catch (err) {
    console.error(`[Bulk Nickname Socket Error]`, err.message);
  }
}

/**
 * Starts staggered bulk nickname change for all manageable guild members.
 */
async function startBulkNickname(client, guildId, { template = '', casing = 'original', sourceNameType = 'displayName', reset = false }) {
  // Check if there is already an active running job for this server
  if (activeNicknameJobs[guildId] && activeNicknameJobs[guildId].status === 'processing') {
    throw new Error('A bulk nickname process is already running for this server.');
  }

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error('Bot is not in this server.');
  }

  console.log(`[Bulk Nickname] Initializing for guild: "${guild.name}" (${guildId})`);

  // Ensure client user is cached and fetch all members
  await guild.members.fetch(client.user.id).catch(() => null);
  const membersCollection = await guild.members.fetch();

  // Filter manageable target members: skip bot itself, server owner, and anyone bot can't edit
  const targetMembers = Array.from(membersCollection.values()).filter(member => {
    if (member.id === client.user.id) return false; // Skip the bot
    if (member.id === guild.ownerId) return false;   // Skip owner (cannot edit owner nick)
    return member.manageable;                        // Must be editable by bot
  });

  const total = targetMembers.length;
  console.log(`[Bulk Nickname] Found ${total} manageable members in "${guild.name}"`);

  // Setup the job state
  activeNicknameJobs[guildId] = {
    status: total > 0 ? 'processing' : 'completed',
    total,
    current: 0,
    success: 0,
    fail: 0,
    template,
    casing,
    sourceNameType,
    reset,
    logs: []
  };

  emitProgress(guildId);

  if (total === 0) {
    console.log(`[Bulk Nickname] No target members to update for guild "${guild.name}"`);
    return activeNicknameJobs[guildId];
  }

  let index = 0;

  const interval = setInterval(async () => {
    const job = activeNicknameJobs[guildId];
    
    // Safety check if job has been cancelled or deleted
    if (!job || job.status === 'cancelled') {
      clearInterval(interval);
      delete activeNicknameIntervals[guildId];
      return;
    }

    if (index >= targetMembers.length) {
      clearInterval(interval);
      delete activeNicknameIntervals[guildId];
      job.status = 'completed';
      emitProgress(guildId);
      console.log(`[Bulk Nickname] Completed for guild "${guild.name}" (${guildId})`);
      return;
    }

    const member = targetMembers[index];
    index++;

    let nickToSet = null;

    if (!reset) {
      const rawName = sourceNameType === 'username' ? member.user.username : member.user.displayName;
      let transformedName = rawName;
      
      if (casing === 'upper') {
        transformedName = rawName.toUpperCase();
      } else if (casing === 'lower') {
        transformedName = rawName.toLowerCase();
      }

      // Substitute the template tokens: {USERNAME} or {DISPLAY_NAME}
      nickToSet = template
        .replace(/\{username\}/gi, transformedName)
        .replace(/\{display_name\}/gi, transformedName);

      // Discord nickname limit: 32 characters
      if (nickToSet.length > 32) {
        nickToSet = nickToSet.substring(0, 32);
      }
    }

    try {
      await member.setNickname(nickToSet, 'Bulk Nickname Change from Admin Portal');
      job.success++;
      job.logs.push({
        username: member.user.username,
        displayName: member.displayName,
        status: 'success',
        nickname: nickToSet || 'Reset to Default'
      });
      console.log(`[Bulk Nickname] Successfully changed nickname for ${member.user.username} (Index: ${index})`);
    } catch (err) {
      job.fail++;
      job.logs.push({
        username: member.user.username,
        displayName: member.displayName,
        status: 'fail',
        error: err.message
      });
      console.error(`[Bulk Nickname] Failed for member ${member.user.username}:`, err.message);
    }

    job.current = index;
    emitProgress(guildId);

  }, 1000); // 1-second delay to safely respect Discord API rate limits

  activeNicknameIntervals[guildId] = interval;
  return activeNicknameJobs[guildId];
}

/**
 * Cancels the active bulk nickname process
 */
function cancelBulkNickname(guildId) {
  const job = activeNicknameJobs[guildId];
  if (job && job.status === 'processing') {
    if (activeNicknameIntervals[guildId]) {
      clearInterval(activeNicknameIntervals[guildId]);
      delete activeNicknameIntervals[guildId];
    }
    job.status = 'cancelled';
    job.logs.push({
      status: 'info',
      message: 'Process cancelled by administrator.'
    });
    emitProgress(guildId);
    console.log(`[Bulk Nickname] Process cancelled for guild ${guildId}`);
    return true;
  }
  return false;
}

/**
 * Gets the current status of the bulk nickname process
 */
function getBulkNicknameStatus(guildId) {
  const job = activeNicknameJobs[guildId];
  if (!job) {
    return { status: 'idle' };
  }
  return {
    status: job.status,
    total: job.total,
    current: job.current,
    success: job.success,
    fail: job.fail,
    template: job.template,
    casing: job.casing,
    sourceNameType: job.sourceNameType,
    reset: job.reset,
    logs: job.logs
  };
}

module.exports = {
  startBulkNickname,
  cancelBulkNickname,
  getBulkNicknameStatus
};
