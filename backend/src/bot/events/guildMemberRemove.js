const { AuditLogEvent } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const { guild, user } = member;
    const guildId = guild.id;

    try {
      // Delay slightly to let the audit log register
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      }).catch(() => null);

      if (fetchedLogs) {
        const kickLog = fetchedLogs.entries.first();
        if (kickLog && kickLog.target.id === user.id) {
          // Verify that this kick happened within the last 15 seconds
          const timeDifference = Date.now() - kickLog.createdTimestamp;
          if (timeDifference < 15000) {
            const { executor, reason: logReason } = kickLog;
            const reason = logReason || 'No reason specified';

            const logEntry = await logModerationAction(guildId, {
              actionType: 'kick',
              moderator: {
                id: executor.id,
                username: executor.username,
                avatar: executor.avatar
              },
              target: {
                id: user.id,
                username: user.username,
                avatar: user.avatar
              },
              details: reason,
              timestamp: new Date()
            });

            console.log(`[Bot Event] Logged kick for ${user.username} in guild ${guildId}`);

            const io = getIo();
            if (io) {
              io.to(`guild_${guildId}`).emit('new_log', logEntry);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildMemberRemove kick:', err.message);
    }
  }
};
