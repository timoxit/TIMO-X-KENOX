const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Broadcast = require('../../database/models/Broadcast');
const { getIo } = require('../../server/socket');

// Stores running intervals to support real-time cancellation
const activeIntervals = {};

/**
 * Emits broadcast progress status via Socket.IO room
 */
function emitBroadcastProgress(guildId, broadcastId, progressData) {
  try {
    const io = getIo();
    if (io) {
      io.to(`guild_${guildId}`).emit('broadcast_progress', {
        broadcastId: broadcastId.toString(),
        ...progressData
      });
      console.log(`[Socket Emit] Emitted progress for broadcast ${broadcastId}:`, progressData);
    }
  } catch (err) {
    console.error(`[Mass DM Progress Socket Error]`, err.message);
  }
}

/**
 * Formats placeholders like {username} and {server}
 */
function formatPlaceholder(str, username, serverName) {
  if (!str) return '';
  return str.replace(/{username}/g, username).replace(/{server}/g, serverName);
}

/**
 * Starts a staggered mass-DM broadcast to members of a guild matching specific filters.
 * @param {object} client Discord client instance
 * @param {string} guildId Guild ID
 * @param {object} data Broadcast data { message, buttons, button, embed, filterRole, excludeRole }
 */
async function startMassDMBroadcast(client, guildId, data) {
  const { message, button, buttons, embed, filterRole, excludeRole, delayInterval } = data;
  const mongoose = require('mongoose');
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[Mass DM] Guild ${guildId} not found in client cache.`);
      return;
    }

    console.log(`[Mass DM] Preparing broadcast for guild "${guild.name}"...`);
    
    let broadcastId = null;
    if (mongoose.connection.readyState === 1) {
      try {
        // Create the initial Broadcast record in the database
        const broadcastDoc = await Broadcast.create({
          guildId,
          message: message || '',
          embed: embed && embed.enabled ? embed : null,
          button: button && button.enabled ? button : null, // Legacy support
          buttons: buttons || (button && button.enabled ? [button] : []),
          sentDMs: [],
          status: 'pending',
          totalTargets: 0,
          successCount: 0,
          failCount: 0,
          filterRole: filterRole || '',
          excludeRole: excludeRole || '',
          delayInterval: Number(delayInterval) || 1,
          scheduledAt: data.scheduledAt || null
        });
        broadcastId = broadcastDoc._id;
      } catch (dbErr) {
        console.error(`[Mass DM Error] Failed to create database log:`, dbErr.message);
      }
    } else {
      console.warn(`[Mass DM] Database is offline/disconnected. Proceeding without database logging.`);
    }

    // Fetch all guild members
    const membersCollection = await guild.members.fetch();
    let targetMembers = membersCollection.filter(member => !member.user.bot);

    // Apply role filters
    if (filterRole) {
      targetMembers = targetMembers.filter(member => member.roles.cache.has(filterRole));
    }
    if (excludeRole) {
      targetMembers = targetMembers.filter(member => !member.roles.cache.has(excludeRole));
    }

    const membersArray = Array.from(targetMembers.values());
    const totalTargets = membersArray.length;

    console.log(`[Mass DM] Queueing messages to ${totalTargets} members in "${guild.name}" (Filter Role: ${filterRole || 'None'}, Exclude Role: ${excludeRole || 'None'})...`);

    if (broadcastId && mongoose.connection.readyState === 1) {
      await Broadcast.findByIdAndUpdate(broadcastId, { 
        totalTargets, 
        status: totalTargets > 0 ? 'sending' : 'completed' 
      });
      emitBroadcastProgress(guildId, broadcastId, {
        status: totalTargets > 0 ? 'sending' : 'completed',
        totalTargets,
        successCount: 0,
        failCount: 0
      });
    }

    if (totalTargets === 0) {
      console.log(`[Mass DM] No target members found. Broadcast marked as completed immediately.`);
      return;
    }

    let index = 0;
    let successCount = 0;
    let failCount = 0;

    const interval = setInterval(async () => {
      // If cancelled externally, clear the interval
      if (broadcastId && !activeIntervals[broadcastId.toString()]) {
        clearInterval(interval);
        return;
      }

      if (index >= membersArray.length) {
        clearInterval(interval);
        if (broadcastId) {
          delete activeIntervals[broadcastId.toString()];
          await Broadcast.findByIdAndUpdate(broadcastId, { status: 'completed' });
          emitBroadcastProgress(guildId, broadcastId, {
            status: 'completed',
            totalTargets,
            successCount,
            failCount
          });
        }
        console.log(`[Mass DM] Broadcast completed for guild "${guild.name}" (${guildId}). DB ID: ${broadcastId || 'Offline'}`);
        return;
      }

      const member = membersArray[index];
      index++;

      let sentMsg = null;
      try {
        // 1. Format text message content placeholders and add server source header
        let formattedMessage = '';
        if (message) {
          formattedMessage = message
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, guild.name);
          
          // Prepend the source server header
          formattedMessage = `Sent from: **${guild.name}**\n\n` + formattedMessage;
        } else {
          // If no custom message body, we still show the source header above embeds/buttons
          formattedMessage = `Sent from: **${guild.name}**`;
        }

        // Truncate to Discord character limits
        if (formattedMessage.length > 2000) {
          formattedMessage = formattedMessage.substring(0, 2000);
        }

        // 2. Format embed placeholders (color, title, description, author, footer, and fields)
        const embeds = [];
        if (embed && embed.enabled && (embed.title || embed.description)) {
          const embedBuilder = new EmbedBuilder()
            .setColor(embed.color || '#2563eb');
            
          // Embed Author
          if (embed.author && embed.author.enabled && embed.author.name) {
            embedBuilder.setAuthor({
              name: formatPlaceholder(embed.author.name, member.user.username, guild.name).substring(0, 256),
              iconURL: embed.author.iconURL || undefined,
              url: embed.author.url || undefined
            });
          } else {
            embedBuilder.setAuthor({ 
              name: guild.name, 
              iconURL: guild.iconURL({ size: 128 }) || undefined 
            });
          }

          if (embed.title) {
            let formattedTitle = formatPlaceholder(embed.title, member.user.username, guild.name);
            if (formattedTitle.length > 256) {
              formattedTitle = formattedTitle.substring(0, 256);
            }
            embedBuilder.setTitle(formattedTitle);
          }
          if (embed.description) {
            let formattedDesc = formatPlaceholder(embed.description, member.user.username, guild.name);
            if (formattedDesc.length > 4000) {
              formattedDesc = formattedDesc.substring(0, 4000);
            }
            embedBuilder.setDescription(formattedDesc);
          }
          if (embed.thumbnail) embedBuilder.setThumbnail(embed.thumbnail);
          if (embed.image) embedBuilder.setImage(embed.image);

          // Embed Fields
          if (embed.fields && Array.isArray(embed.fields)) {
            const validFields = embed.fields
              .filter(f => f && f.name && f.value)
              .slice(0, 25)
              .map(f => ({
                name: formatPlaceholder(f.name, member.user.username, guild.name).substring(0, 256),
                value: formatPlaceholder(f.value, member.user.username, guild.name).substring(0, 1024),
                inline: !!f.inline
              }));
            if (validFields.length > 0) {
              embedBuilder.addFields(validFields);
            }
          }

          // Embed Footer
          if (embed.footer && embed.footer.enabled && embed.footer.text) {
            embedBuilder.setFooter({
              text: formatPlaceholder(embed.footer.text, member.user.username, guild.name).substring(0, 2048),
              iconURL: embed.footer.iconURL || undefined
            });
          } else {
            embedBuilder.setFooter({ 
              text: `${guild.name} Official Announcement`, 
              iconURL: guild.iconURL({ size: 128 }) || undefined 
            });
          }
          
          embeds.push(embedBuilder);
        }

        // 3. Construct Button components (support up to 5)
        const components = [];
        let buttonsList = [];
        if (buttons && Array.isArray(buttons)) {
          buttonsList = buttons.filter(btn => btn && btn.label && btn.url);
        } else if (button && button.enabled && button.label && button.url) {
          buttonsList = [{ label: button.label, url: button.url }];
        }

        if (buttonsList.length > 0) {
          const row = new ActionRowBuilder();
          buttonsList.slice(0, 5).forEach(btn => {
            row.addComponents(
              new ButtonBuilder()
                .setLabel(btn.label.substring(0, 80))
                .setURL(btn.url)
                .setStyle(ButtonStyle.Link)
            );
          });
          components.push(row);
        }

        // 4. Send the DM
        sentMsg = await member.send({
          content: formattedMessage || undefined,
          embeds: embeds.length > 0 ? embeds : undefined,
          components: components.length > 0 ? components : undefined
        });

        successCount++;
        console.log(`[Mass DM] [${index}/${totalTargets}] Successfully sent DM to ${member.user.username}`);
      } catch (err) {
        failCount++;
        if (err.code === 50007) {
          console.log(`[Mass DM] [${index}/${totalTargets}] Skipped member ${member.user.username} (DMs closed)`);
        } else {
          console.error(`[Mass DM] [${index}/${totalTargets}] Failed to DM member ${member.user.username}:`, err.message);
        }
      }

      // 5. Update DB and emit progress
      if (broadcastId && mongoose.connection.readyState === 1) {
        try {
          const updateData = {
            successCount,
            failCount
          };
          if (sentMsg) {
            updateData.$push = { sentDMs: { userId: member.id, messageId: sentMsg.id } };
          }
          if (index >= membersArray.length) {
            updateData.status = 'completed';
          }
          await Broadcast.findByIdAndUpdate(broadcastId, updateData);
          emitBroadcastProgress(guildId, broadcastId, {
            status: index >= membersArray.length ? 'completed' : 'sending',
            totalTargets,
            successCount,
            failCount
          });
        } catch (dbErr) {
          console.error(`[Mass DM Error] Failed to update progress in database:`, dbErr.message);
        }
      }
    }, (Number(delayInterval) || 1) * 1000); // delay between DMs to respect Discord rate limits

    if (broadcastId) {
      activeIntervals[broadcastId.toString()] = interval;
    }
    
  } catch (error) {
    console.error(`[Mass DM Error] Failed to fetch members or setup broadcast for guild ${guildId}:`, error.message);
  }
}

/**
 * Revokes previously sent DMs in a broadcast by deleting the messages.
 * @param {object} client Discord client instance
 * @param {string} broadcastId Database Broadcast ID
 */
async function revokeBroadcastDMs(client, broadcastId) {
  try {
    const broadcastDoc = await Broadcast.findById(broadcastId);
    if (!broadcastDoc) {
      console.error(`[Mass DM Revoke] Broadcast ${broadcastId} not found in database.`);
      return;
    }

    if (broadcastDoc.revoked) {
      console.log(`[Mass DM Revoke] Broadcast ${broadcastId} is already marked as revoked.`);
      return;
    }

    // Set revoked to true immediately to prevent double calls
    broadcastDoc.revoked = true;
    await broadcastDoc.save();

    console.log(`[Mass DM Revoke] Starting revocation for broadcast ${broadcastId} (${broadcastDoc.sentDMs.length} messages)...`);

    let index = 0;
    const sentDMs = broadcastDoc.sentDMs;

    const interval = setInterval(async () => {
      if (index >= sentDMs.length) {
        clearInterval(interval);
        console.log(`[Mass DM Revoke] Finished revoking DMs for broadcast ${broadcastId}`);
        return;
      }

      const { userId, messageId } = sentDMs[index];
      index++;

      try {
        const user = await client.users.fetch(userId).catch(() => null);
        if (user) {
          const dmChannel = user.dmChannel || await user.createDM().catch(() => null);
          if (dmChannel) {
            const msg = await dmChannel.messages.fetch(messageId).catch(() => null);
            if (msg) {
              await msg.delete();
              console.log(`[Mass DM Revoke] Deleted message ${messageId} for user ${user.tag}`);
            }
          }
        }
      } catch (err) {
        console.error(`[Mass DM Revoke] Failed to delete message ${messageId} for user ID ${userId}:`, err.message);
      }
    }, 500); // 500ms delay between deletions to avoid hitting rate limits
  } catch (error) {
    console.error(`[Mass DM Revoke Error] Error executing revocation:`, error.message);
  }
}

/**
 * Cancels an active running Mass DM Broadcast.
 * @param {string} broadcastId Database Broadcast ID
 */
async function cancelMassDMBroadcast(broadcastId) {
  const broadcastIdStr = broadcastId.toString();
  console.log(`[Mass DM Cancel] Request received for broadcast ${broadcastIdStr}`);
  
  if (activeIntervals[broadcastIdStr]) {
    clearInterval(activeIntervals[broadcastIdStr]);
    delete activeIntervals[broadcastIdStr];
    
    await Broadcast.findByIdAndUpdate(broadcastId, { status: 'cancelled' });
    
    const doc = await Broadcast.findById(broadcastId);
    if (doc) {
      console.log(`[Mass DM Cancel] Cancelled active interval for broadcast ${broadcastIdStr}`);
      emitBroadcastProgress(doc.guildId, broadcastId, {
        status: 'cancelled',
        totalTargets: doc.totalTargets,
        successCount: doc.successCount,
        failCount: doc.failCount
      });
    }
    return true;
  }
  
  // If not in active memory, check if it's currently marked as sending in DB, and mark as cancelled
  const doc = await Broadcast.findById(broadcastId);
  if (doc && doc.status === 'sending') {
    doc.status = 'cancelled';
    await doc.save();
    emitBroadcastProgress(doc.guildId, broadcastId, {
      status: 'cancelled',
      totalTargets: doc.totalTargets,
      successCount: doc.successCount,
      failCount: doc.failCount
    });
    return true;
  }
  
  return false;
}

/**
 * Sends a single test DM to a specific user (the administrator).
 * @param {object} client Discord client instance
 * @param {string} userId The admin's Discord user ID
 * @param {string} guildId The current guild ID
 * @param {object} data DM content data
 */
async function sendTestDM(client, userId, guildId, data) {
  const { message, button, buttons, embed } = data;
  try {
    const guild = client.guilds.cache.get(guildId);
    const guildName = guild ? guild.name : 'Test Server';
    const guildIcon = guild ? guild.iconURL({ size: 128 }) : null;

    const user = await client.users.fetch(userId);
    if (!user) {
      console.error(`[Mass DM Test] User ${userId} not found.`);
      return false;
    }

    // 1. Format text message
    let formattedMessage = '';
    if (message) {
      formattedMessage = message
        .replace(/{username}/g, user.username)
        .replace(/{server}/g, guildName);
      formattedMessage = `Sent from (TEST PREVIEW): **${guildName}**\n\n` + formattedMessage;
    } else {
      formattedMessage = `Sent from (TEST PREVIEW): **${guildName}**`;
    }

    if (formattedMessage.length > 2000) {
      formattedMessage = formattedMessage.substring(0, 2000);
    }

    // 2. Format embed
    const embeds = [];
    if (embed && embed.enabled && (embed.title || embed.description)) {
      const embedBuilder = new EmbedBuilder()
        .setColor(embed.color || '#2563eb');

      if (embed.author && embed.author.enabled && embed.author.name) {
        embedBuilder.setAuthor({
          name: formatPlaceholder(embed.author.name, user.username, guildName).substring(0, 256),
          iconURL: embed.author.iconURL || undefined,
          url: embed.author.url || undefined
        });
      } else {
        embedBuilder.setAuthor({ 
          name: guildName, 
          iconURL: guildIcon || undefined 
        });
      }

      if (embed.title) {
        let formattedTitle = formatPlaceholder(embed.title, user.username, guildName);
        if (formattedTitle.length > 256) formattedTitle = formattedTitle.substring(0, 256);
        embedBuilder.setTitle(formattedTitle);
      }
      if (embed.description) {
        let formattedDesc = formatPlaceholder(embed.description, user.username, guildName);
        if (formattedDesc.length > 4000) formattedDesc = formattedDesc.substring(0, 4000);
        embedBuilder.setDescription(formattedDesc);
      }
      if (embed.thumbnail) embedBuilder.setThumbnail(embed.thumbnail);
      if (embed.image) embedBuilder.setImage(embed.image);

      if (embed.fields && Array.isArray(embed.fields)) {
        const validFields = embed.fields
          .filter(f => f && f.name && f.value)
          .slice(0, 25)
          .map(f => ({
            name: formatPlaceholder(f.name, user.username, guildName).substring(0, 256),
            value: formatPlaceholder(f.value, user.username, guildName).substring(0, 1024),
            inline: !!f.inline
          }));
        if (validFields.length > 0) {
          embedBuilder.addFields(validFields);
        }
      }

      if (embed.footer && embed.footer.enabled && embed.footer.text) {
        embedBuilder.setFooter({
          text: formatPlaceholder(embed.footer.text, user.username, guildName).substring(0, 2048),
          iconURL: embed.footer.iconURL || undefined
        });
      } else {
        embedBuilder.setFooter({ 
          text: `${guildName} Official Announcement (Test)`, 
          iconURL: guildIcon || undefined 
        });
      }

      embeds.push(embedBuilder);
    }

    // 3. Format buttons
    const components = [];
    let buttonsList = [];
    if (buttons && Array.isArray(buttons)) {
      buttonsList = buttons.filter(btn => btn && btn.label && btn.url);
    } else if (button && button.enabled && button.label && button.url) {
      buttonsList = [{ label: button.label, url: button.url }];
    }

    if (buttonsList.length > 0) {
      const row = new ActionRowBuilder();
      buttonsList.slice(0, 5).forEach(btn => {
        row.addComponents(
          new ButtonBuilder()
            .setLabel(btn.label.substring(0, 80))
            .setURL(btn.url)
            .setStyle(ButtonStyle.Link)
        );
      });
      components.push(row);
    }

    // 4. Send the DM
    await user.send({
      content: formattedMessage || undefined,
      embeds: embeds.length > 0 ? embeds : undefined,
      components: components.length > 0 ? components : undefined
    });

    return true;
  } catch (error) {
    console.error(`[Mass DM Test Error] Failed to send test DM to user ${userId}:`, error.message);
    return false;
  }
}

module.exports = { startMassDMBroadcast, revokeBroadcastDMs, cancelMassDMBroadcast, sendTestDM };
