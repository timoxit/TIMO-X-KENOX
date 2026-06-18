const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { generateWelcomeCard } = require('../utils/welcomeCard');
const config = require('../../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildId = member.guild.id;
    console.log(`[Bot Event] guildMemberAdd triggered for member ${member.user.tag} (${member.user.id}) in guild ${guildId}`);

    try {
      const settings = await getGuildSettings(guildId);
      console.log(`[Bot Event] Settings retrieved. Welcome status: ${settings?.welcome?.enabled ? 'ENABLED' : 'DISABLED'}, channelId: ${settings?.welcome?.channelId || 'not configured'}`);

      const autoRole = settings.autoRole;
      if (autoRole && autoRole.enabled && autoRole.roleId) {
        const role = member.guild.roles.cache.get(autoRole.roleId);
        if (role) {
          await member.roles.add(role).catch(err => {
            console.error(`[Bot] Failed to assign auto-role to ${member.user.tag}:`, err.message);
          });
        }
      }

      const autoNick = settings.autoNickname;
      if (autoNick && autoNick.enabled && autoNick.format) {
        let nickname = autoNick.format
          .replace(/{username}/g, member.user.displayName)
          .replace(/{tag}/g, member.user.tag);
        
        if (nickname.length > 32) {
          nickname = nickname.substring(0, 29) + '...';
        }

        await member.setNickname(nickname).catch(err => {
          console.error(`[Bot] Failed to set auto-nickname for ${member.user.tag}:`, err.message);
        });
      }

      const welcome = settings.welcome;
      if (welcome && welcome.enabled && welcome.channelId) {
        let channel = member.guild.channels.cache.get(welcome.channelId);
        if (!channel) {
          console.log(`[Bot Event] Welcome channel ${welcome.channelId} not found in cache, trying to fetch...`);
          try {
            channel = await member.guild.channels.fetch(welcome.channelId);
          } catch (fetchErr) {
            console.error(`[Bot Event] Failed to fetch welcome channel ${welcome.channelId}:`, fetchErr.message);
          }
        }

        if (channel) {
          console.log(`[Bot Event] Sending welcome message to channel: ${channel.name} (${channel.id}) using layout: ${welcome.layoutType || 'classic'}`);
          let messageText = welcome.message || 'Welcome {user} to the server!';
          messageText = messageText
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name);

          const layout = welcome.layoutType || 'classic';

          if (layout === 'text-only') {
            await channel.send(messageText).catch(err => {
              console.error(`[Bot] Failed to send text-only welcome message:`, err.message);
            });
            return;
          }

          if (layout === 'embed-only') {
            const embed = new EmbedBuilder()
              .setTitle(`Welcome to ${member.guild.name}!`)
              .setDescription(messageText)
              .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
              .setColor(welcome.textColor || '#2563eb')
              .setTimestamp();

            await channel.send({ content: `${member}`, embeds: [embed] }).catch(err => {
              console.error(`[Bot] Failed to send embed-only welcome message:`, err.message);
            });
            return;
          }

          const isGif = welcome.gifSupport && welcome.background && welcome.background.toLowerCase().includes('.gif');

          if (isGif) {
            let gifUrl = welcome.background;
            if (gifUrl.startsWith('/')) {
              gifUrl = `${config.frontendUrl.replace(/\/$/, '')}${gifUrl}`;
            }

            const embed = new EmbedBuilder()
              .setTitle(`Welcome to ${member.guild.name}!`)
              .setDescription(messageText)
              .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
              .setImage(gifUrl)
              .setColor(welcome.textColor || '#2563eb')
              .setTimestamp();

            await channel.send({ content: `${member}`, embeds: [embed] }).catch(err => {
              console.error(`[Bot] Failed to send welcome embed:`, err.message);
            });
          } else {
            try {
              const imageBuffer = await generateWelcomeCard(member, welcome);
              const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });

              if (layout === 'embed-card') {
                const embed = new EmbedBuilder()
                  .setTitle(`Welcome to ${member.guild.name}!`)
                  .setDescription(messageText)
                  .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
                  .setImage('attachment://welcome.png')
                  .setColor(welcome.textColor || '#2563eb')
                  .setTimestamp();

                await channel.send({
                  content: `${member}`,
                  embeds: [embed],
                  files: [attachment]
                });
              } else {
                // Classic layout
                await channel.send({
                  content: messageText,
                  files: [attachment]
                });
              }
            } catch (err) {
              console.error('[Bot] Canvas welcome card generation failed:', err.message);
              await channel.send(messageText).catch(() => {});
            }
          }
        } else {
          console.warn(`[Bot Event] Welcome channel ${welcome.channelId} could not be resolved (not found or bot lacks permissions).`);
        }
      } else {
        console.log(`[Bot Event] Welcome feature skipped. Enabled: ${welcome?.enabled}, Channel ID: ${welcome?.channelId}`);
      }
    } catch (error) {
      console.error('[Bot] Error in guildMemberAdd handler:', error);
    }
  }
};
