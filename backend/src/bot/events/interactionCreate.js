const { getGuildSettings } = require('../../database/settingsManager');
const { MessageFlags } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName;
      let command;
      
      try {
        command = require(`../commands/${commandName}`);
      } catch (err) {
        console.error(`Command not found: ${commandName}`, err);
        return;
      }

      if (command) {
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(`Error executing slash command ${commandName}:`, error);
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
              await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
          } catch (replyError) {
            console.error('[Bot] Failed to send slash command error reply:', replyError.message);
          }
        }
      }
    }

    if (interaction.isButton()) {
      const guildId = interaction.guildId;

      if (interaction.customId === 'verify_member') {
        try {
          const settings = await getGuildSettings(guildId);
          
          if (!settings || !settings.verification.enabled) {
            return interaction.reply({ content: 'Verification is currently disabled on this server.', flags: MessageFlags.Ephemeral });
          }

          const roleId = settings.verification.roleId;
          if (!roleId) {
            return interaction.reply({ content: 'Verification role is not configured. Please contact an Administrator.', flags: MessageFlags.Ephemeral });
          }

          const role = interaction.guild.roles.cache.get(roleId);
          if (!role) {
            return interaction.reply({ content: 'The configured verification role does not exist on this server.', flags: MessageFlags.Ephemeral });
          }

          const member = interaction.member;
          if (member.roles.cache.has(roleId)) {
            return interaction.reply({ content: 'You are already verified!', flags: MessageFlags.Ephemeral });
          }

          await member.roles.add(role);
          
          await interaction.reply({ content: 'Verification successful! You now have access to the server.', flags: MessageFlags.Ephemeral });
        } catch (error) {
          console.error('[Bot] Error during verification button interaction:', error);
          try {
            if (interaction.deferred || interaction.replied) {
              await interaction.editReply({ content: 'An error occurred during verification. Please try again or verify permissions.' });
            } else {
              await interaction.reply({ content: 'An error occurred during verification. Please try again or verify permissions.', flags: MessageFlags.Ephemeral });
            }
          } catch (replyError) {
            console.error('[Bot] Failed to send verification error reply:', replyError.message);
          }
        }
      }

      // Ticket opening interaction
      if (interaction.customId === 'open_ticket') {
        try {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });

          const settings = await getGuildSettings(guildId);
          if (!settings || !settings.tickets || !settings.tickets.enabled) {
            return interaction.editReply({ content: 'Ticket system is currently disabled on this server.' });
          }

          const member = interaction.member;
          const ticketChannelName = `ticket-${member.user.username.toLowerCase()}`.substring(0, 100);

          // Check if user already has an active ticket channel in this category
          const parentId = settings.tickets.categoryId || null;
          const existingChannel = interaction.guild.channels.cache.find(
            c => c.name === ticketChannelName && (!parentId || c.parentId === parentId)
          );

          if (existingChannel) {
            return interaction.editReply({ content: `You already have an open ticket in <#${existingChannel.id}>.` });
          }

          const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

          // Create private channel
          const channel = await interaction.guild.channels.create({
            name: ticketChannelName,
            type: ChannelType.GuildText,
            parent: parentId,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
              },
              ...(settings.tickets.supportRoleId ? [{
                id: settings.tickets.supportRoleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
              }] : [])
            ]
          });

          // Send welcome embed inside the ticket channel
          const welcomeTemplate = settings.tickets.ticketMessage || 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.';
          const resolvedWelcomeText = welcomeTemplate
            .replace(/{user}/g, `<@${interaction.user.id}>`)
            .replace(/{username}/g, interaction.user.username)
            .replace(/{server}/g, interaction.guild.name);

          const embed = new EmbedBuilder()
            .setTitle(settings.tickets.title || 'Support Ticket')
            .setDescription(resolvedWelcomeText)
            .setColor('#2563eb')
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Close Ticket')
              .setStyle(ButtonStyle.Danger)
          );

          await channel.send({
            content: settings.tickets.supportRoleId ? `<@&${settings.tickets.supportRoleId}>` : undefined,
            embeds: [embed],
            components: [row]
          });

          await interaction.editReply({ content: `Ticket created! Head over to <#${channel.id}> to get support.` });
        } catch (error) {
          console.error('[Bot] Error during ticket opening:', error);
          try {
            if (interaction.deferred || interaction.replied) {
              await interaction.editReply({ content: 'Failed to create ticket: ' + error.message });
            } else {
              await interaction.reply({ content: 'Failed to create ticket: ' + error.message, flags: MessageFlags.Ephemeral });
            }
          } catch (replyError) {
            console.error('[Bot] Failed to send ticket opening error reply:', replyError.message);
          }
        }
      }

      // Ticket closing interaction
      if (interaction.customId === 'close_ticket') {
        try {
          const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

          const embed = new EmbedBuilder()
            .setTitle('Close Ticket')
            .setDescription('Are you sure you want to close and delete this ticket channel?')
            .setColor('#f43f5e');

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('confirm_close_ticket')
              .setLabel('Yes, Close')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('cancel_close_ticket')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
          console.error('[Bot] Error during ticket closing prompt:', error);
        }
      }

      // Confirm closing/deleting channel
      if (interaction.customId === 'confirm_close_ticket') {
        try {
          await interaction.reply({ content: 'This ticket will be closed and deleted in 5 seconds...' });
          setTimeout(async () => {
            try {
              await interaction.channel.delete();
            } catch (err) {
              console.error('[Bot] Failed to delete ticket channel:', err.message);
            }
          }, 5000);
        } catch (error) {
          console.error('[Bot] Error during ticket confirm closing:', error);
        }
      }

      // Cancel closing channel
      if (interaction.customId === 'cancel_close_ticket') {
        try {
          await interaction.deferUpdate().catch(() => {});
          await interaction.message.delete().catch(() => {});
        } catch (error) {
          console.error('[Bot] Error during ticket cancel closing:', error);
        }
      }

      // Poll button vote interaction
      if (interaction.customId.startsWith('pv_')) {
        try {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });

          const parts = interaction.customId.split('_');
          const pollId = parts[1];
          const optionId = parts.slice(2).join('_');

          const Poll = require('../../database/models/Poll');
          const { renderPollEmbed, renderPollComponents } = require('../utils/pollHelper');
          const { getIo } = require('../../server/socket');

          const poll = await Poll.findById(pollId);
          if (!poll) {
            return interaction.editReply({ content: '❌ Poll not found in database.' });
          }

          if (poll.status === 'ended') {
            return interaction.editReply({ content: '❌ This poll has already ended.' });
          }

          if (poll.settings.expiresAt && new Date(poll.settings.expiresAt) <= new Date()) {
            poll.status = 'ended';
            await poll.save();
            
            const embed = renderPollEmbed(poll, interaction.guild);
            const components = renderPollComponents(poll);
            await interaction.message.edit({ embeds: [embed], components: components });

            const io = getIo();
            if (io) io.to(`guild_${interaction.guildId}`).emit('poll_update', poll);

            return interaction.editReply({ content: '❌ This poll has expired.' });
          }

          const userId = interaction.user.id;
          const option = poll.options.find(opt => opt.id === optionId);
          if (!option) {
            return interaction.editReply({ content: '❌ Selected option not found.' });
          }

          let responseMsg = '';

          if (poll.settings.multipleChoice) {
            // Multiple Choice
            const voterIndex = option.votes.indexOf(userId);
            if (voterIndex > -1) {
              option.votes.splice(voterIndex, 1);
              responseMsg = `Your vote for **"${option.text}"** has been retracted.`;
            } else {
              option.votes.push(userId);
              responseMsg = `Your vote for **"${option.text}"** has been registered.`;
            }
          } else {
            // Single Choice
            let previouslyVotedOpt = null;
            poll.options.forEach(opt => {
              const idx = opt.votes.indexOf(userId);
              if (idx > -1) {
                previouslyVotedOpt = opt;
                opt.votes.splice(idx, 1);
              }
            });

            if (previouslyVotedOpt && previouslyVotedOpt.id === optionId) {
              responseMsg = `Your vote for **"${option.text}"** has been retracted.`;
            } else {
              option.votes.push(userId);
              if (previouslyVotedOpt) {
                responseMsg = `Your vote has been updated from **"${previouslyVotedOpt.text}"** to **"${option.text}"**.`;
              } else {
                responseMsg = `Your vote for **"${option.text}"** has been registered.`;
              }
            }
          }

          await poll.save();

          // Refresh the Discord message
          const embed = renderPollEmbed(poll, interaction.guild);
          const components = renderPollComponents(poll);
          await interaction.message.edit({ embeds: [embed], components: components });

          // Emit Socket.io update
          const io = getIo();
          if (io) {
            io.to(`guild_${interaction.guildId}`).emit('poll_update', poll);
          }

          await interaction.editReply({ content: `✅ ${responseMsg}` });
        } catch (err) {
          console.error('[Bot interactionCreate Error] Poll button interaction failed:', err);
          await interaction.editReply({ content: '❌ Failed to process your vote: ' + err.message });
        }
      }
    }
  }
};
