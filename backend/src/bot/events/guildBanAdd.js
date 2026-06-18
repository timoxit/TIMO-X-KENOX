const { AuditLogEvent } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    const { guild, user } = ban;
    const guildId = guild.id;

    try {
      // Small delay to allow Discord to write the audit log entry
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      }).catch(() => null);

      let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
      let reason = 'No reason specified';

      if (fetchedLogs) {
        const banLog = fetchedLogs.entries.first();
        if (banLog && banLog.target.id === user.id) {
          const { executor, reason: logReason } = banLog;
          moderator = {
            id: executor.id,
            username: executor.username,
            avatar: executor.avatar
          };
          if (logReason) reason = logReason;
        }
      }

      const logEntry = await logModerationAction(guildId, {
        actionType: 'ban',
        moderator,
        target: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        details: reason,
        timestamp: new Date()
      });

      console.log(`[Bot Event] Logged ban for ${user.username} in guild ${guildId}`);

      const io = getIo();
      if (io) {
        io.to(`guild_${guildId}`).emit('new_log', logEntry);
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildBanAdd:', err.message);
    }
  }
};
