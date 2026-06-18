const { AuditLogEvent } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.partial) return;

    const guildId = message.guild.id;

    try {
      // Delay slightly to let audit logs register
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 5,
        type: AuditLogEvent.MessageDelete,
      }).catch(() => null);

      let moderator = null;

      if (fetchedLogs) {
        // Find the audit log entry for this author's message deletion
        const deleteLog = fetchedLogs.entries.find(entry => 
          entry.target.id === message.author.id &&
          (Date.now() - entry.createdTimestamp < 15000)
        );

        if (deleteLog) {
          const { executor } = deleteLog;
          moderator = {
            id: executor.id,
            username: executor.username,
            avatar: executor.avatar
          };
        }
      }

      // If the deletion was in the audit log (deleted by a moderator or bot)
      if (moderator) {
        const logEntry = await logModerationAction(guildId, {
          actionType: 'message_delete',
          moderator,
          target: {
            id: message.author.id,
            username: message.author.username,
            avatar: message.author.avatar
          },
          details: `Message deleted in #${message.channel.name}. Content preview: "${message.content ? message.content.substring(0, 100) : '[Attachment/Embed]'}"`,
          timestamp: new Date()
        });

        console.log(`[Bot Event] Logged message delete in guild ${guildId} by ${moderator.username}`);

        const io = getIo();
        if (io) {
          io.to(`guild_${guildId}`).emit('new_log', logEntry);
        }
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log messageDelete:', err.message);
    }
  }
};
