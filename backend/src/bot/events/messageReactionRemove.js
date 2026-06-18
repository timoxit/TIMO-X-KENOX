const { getGuildSettings } = require('../../database/settingsManager');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    // If the reaction is partial, fetch it to get full message details
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('[Bot Event Error] Failed to fetch partial reaction:', error.message);
        return;
      }
    }

    // Ignore reactions from bots
    if (user.bot) return;

    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;

    const guildId = guild.id;

    try {
      const settings = await getGuildSettings(guildId);
      if (!settings || !settings.verification.enabled) return;

      // Check if it's the reaction role verification message
      if (settings.verification.type === 'reaction' && settings.verification.messageId === message.id) {
        const configEmoji = settings.verification.reactionEmoji || '✅';
        const reactionEmoji = reaction.emoji.name;

        // Check if emoji matches (standard name, custom ID, or string representation)
        const isMatch = 
          reactionEmoji === configEmoji || 
          reaction.emoji.toString() === configEmoji || 
          reaction.emoji.id === configEmoji;

        if (isMatch) {
          const roleId = settings.verification.roleId;
          if (!roleId) return;

          const role = guild.roles.cache.get(roleId);
          if (!role) return;

          const member = await guild.members.fetch(user.id).catch(() => null);
          if (!member) return;

          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            console.log(`[Bot Event] Reaction Verification: Removed role ${role.name} from ${user.username} in guild ${guildId}`);
          }
        }
      }
    } catch (error) {
      console.error('[Bot Event Error] Error in messageReactionRemove handler:', error);
    }
  }
};
