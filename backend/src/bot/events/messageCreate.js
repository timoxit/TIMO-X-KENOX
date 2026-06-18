const { PermissionsBitField } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { checkSpam, resetSpam } = require('../utils/antiSpam');
const { hasForbiddenLink } = require('../utils/linkCheck');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    if (message.member && message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return;
    }

    const guildId = message.guild.id;
    const channelId = message.channel.id;
    const userId = message.author.id;

    try {
      const settings = await getGuildSettings(guildId);

      const spamSettings = settings.moderation.spam;
      if (spamSettings && spamSettings.enabled && spamSettings.protectedChannels && spamSettings.protectedChannels.includes(channelId)) {
        const spamResult = checkSpam(
          message,
          spamSettings.maxMessages, 
          spamSettings.timeWindow
        );

        if (spamResult.isSpamming) {
          // Delete all spam messages in the window
          for (const msg of spamResult.messages) {
            await msg.delete().catch(err => {
              console.error(`[Bot] Failed to delete spam message:`, err.message);
            });
          }
          
          if (message.member && message.member.moderatable) {
            const durationMs = spamSettings.timeoutDuration * 60 * 1000;
            await message.member.timeout(durationMs, 'Spamming messages').catch(err => {
              console.error(`Failed to timeout member ${userId}:`, err.message);
            });

            const alert = await message.channel.send(
              `⚠️ ${message.author}, you have been timed out for ${spamSettings.timeoutDuration} minutes due to spamming.`
            );
            setTimeout(() => alert.delete().catch(() => {}), 5000);
          } else {
            const alert = await message.channel.send(
              `⚠️ ${message.author}, please stop spamming.`
            );
            setTimeout(() => alert.delete().catch(() => {}), 5000);
          }

          resetSpam(userId, channelId);
          return;
        }
      }

      const linkSettings = settings.moderation.links;
      if (linkSettings && linkSettings.enabled && linkSettings.protectedChannels && linkSettings.protectedChannels.includes(channelId)) {
        const forbidden = hasForbiddenLink(message.content, linkSettings.allowedLinks);
        
        if (forbidden) {
          await message.delete().catch(() => {});
          
          const alert = await message.channel.send(
            `🚫 ${message.author}, links are not allowed in this channel.`
          );
          setTimeout(() => alert.delete().catch(() => {}), 5000);
          return;
        }
      }
    } catch (error) {
      console.error('[Bot] Error in messageCreate handler:', error);
    }
  }
};
