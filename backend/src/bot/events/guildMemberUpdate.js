const { AuditLogEvent } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const { guild, user } = newMember;
    const guildId = guild.id;

    try {
      // 1. Detect Timeouts
      const oldTimeout = oldMember.communicationDisabledUntil;
      const newTimeout = newMember.communicationDisabledUntil;

      if (newTimeout && (!oldTimeout || oldTimeout.getTime() !== newTimeout.getTime())) {
        const timeoutMs = newTimeout.getTime() - Date.now();
        if (timeoutMs > 1000) {
          const durationMinutes = Math.round(timeoutMs / 60000);
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberUpdate,
          }).catch(() => null);

          let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
          let reason = 'No reason specified';

          if (fetchedLogs) {
            const timeoutLog = fetchedLogs.entries.find(entry => 
              entry.target.id === user.id && 
              entry.changes.some(change => change.key === 'communication_disabled_until')
            );
            if (timeoutLog) {
              const { executor, reason: logReason } = timeoutLog;
              moderator = {
                id: executor.id,
                username: executor.username,
                avatar: executor.avatar
              };
              if (logReason) reason = logReason;
            }
          }

          const logEntry = await logModerationAction(guildId, {
            actionType: 'timeout',
            moderator,
            target: {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            },
            details: `Timed out for ${durationMinutes} minutes. Reason: ${reason}`,
            timestamp: new Date()
          });

          console.log(`[Bot Event] Logged timeout for ${user.username} in guild ${guildId}`);

          const io = getIo();
          if (io) {
            io.to(`guild_${guildId}`).emit('new_log', logEntry);
          }
        }
      }

      // 2. Detect Role Updates
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      if (oldRoles.size !== newRoles.size) {
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberRoleUpdate,
          }).catch(() => null);

          let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
          if (fetchedLogs) {
            const roleUpdateLog = fetchedLogs.entries.first();
            if (roleUpdateLog && roleUpdateLog.target.id === user.id) {
              const { executor } = roleUpdateLog;
              moderator = {
                id: executor.id,
                username: executor.username,
                avatar: executor.avatar
              };
            }
          }

          const addedNames = addedRoles.map(r => `+${r.name}`).join(', ');
          const removedNames = removedRoles.map(r => `-${r.name}`).join(', ');
          const roleChanges = [addedNames, removedNames].filter(Boolean).join(' | ');

          const logEntry = await logModerationAction(guildId, {
            actionType: 'role_update',
            moderator,
            target: {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            },
            details: `Roles updated: ${roleChanges}`,
            timestamp: new Date()
          });

          console.log(`[Bot Event] Logged role update for ${user.username} in guild ${guildId}`);

          const io = getIo();
          if (io) {
            io.to(`guild_${guildId}`).emit('new_log', logEntry);
          }
        }
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildMemberUpdate:', err.message);
    }
  }
};
