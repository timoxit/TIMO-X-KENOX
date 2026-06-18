const { ChannelType } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    try {
      const settings = await getGuildSettings(guild.id);
      if (!settings || !settings.tempVoice || !settings.tempVoice.enabled) return;

      const tempConfig = settings.tempVoice;
      const joinToCreateId = tempConfig.channelId;
      if (!joinToCreateId) return;

      // 1. User Joined the "Join to Create" channel
      if (newState.channelId === joinToCreateId) {
        const member = newState.member;
        if (!member) return;

        const username = member.user.username;
        const channelName = tempConfig.nameTemplate
          ? tempConfig.nameTemplate.replace(/{username}/g, username)
          : `🔊 ${username}'s Room`;

        // Resolve target parent category
        const triggerChannel = guild.channels.cache.get(joinToCreateId);
        const parentId = tempConfig.categoryId || triggerChannel?.parentId || undefined;

        console.log(`[Temp Voice] Creating room "${channelName}" for ${username} in category ${parentId}`);

        // Create temporary voice channel
        const tempChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: parentId,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ['ManageChannels', 'MoveMembers', 'MuteMembers', 'DeafenMembers', 'Connect', 'Speak']
            },
            {
              id: guild.id, // @everyone role
              allow: ['Connect', 'Speak']
            }
          ]
        });

        // Move member to the temporary channel
        await member.voice.setChannel(tempChannel);
      }

      // 2. User Left a Channel - Check if it was an empty temporary channel
      if (oldState.channelId && oldState.channelId !== newState.channelId) {
        const oldChannel = oldState.channel;
        if (oldChannel && oldChannel.id !== joinToCreateId) {
          // If it is a voice channel, has 0 members, and belongs to our configured category
          if (oldChannel.type === ChannelType.GuildVoice && oldChannel.members.size === 0) {
            const triggerChannel = guild.channels.cache.get(joinToCreateId);
            const parentId = tempConfig.categoryId || triggerChannel?.parentId;

            const isInCategory = parentId ? oldChannel.parentId === parentId : true;

            if (isInCategory) {
              // Perform pattern matching on the channel name to prevent deleting permanent channels
              const nameMatches = oldChannel.name.includes("'s Room") || 
                                  oldChannel.name.includes("'s Channel") || 
                                  oldChannel.name.startsWith('🔊') ||
                                  (tempConfig.nameTemplate && oldChannel.name.includes(tempConfig.nameTemplate.replace(/{username}/g, '').trim()));

              if (nameMatches) {
                console.log(`[Temp Voice] Deleting empty temporary voice channel "${oldChannel.name}"`);
                await oldChannel.delete('Temporary Voice Channel - Empty').catch(err => {
                  console.error('[Temp Voice] Failed to delete empty channel:', err.message);
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[Temp Voice] Error in voiceStateUpdate handler:', error);
    }
  }
};
