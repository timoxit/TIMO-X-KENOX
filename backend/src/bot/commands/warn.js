const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a user and logs the action')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for warning the user')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guildId = interaction.guildId;

    try {
      const logEntry = await logModerationAction(guildId, {
        actionType: 'warn',
        moderator: {
          id: interaction.user.id,
          username: interaction.user.username,
          avatar: interaction.user.avatar
        },
        target: {
          id: targetUser.id,
          username: targetUser.username,
          avatar: targetUser.avatar
        },
        details: reason,
        timestamp: new Date()
      });

      // Broadcast log via Socket.IO
      const io = getIo();
      if (io) {
        io.to(`guild_${guildId}`).emit('new_log', logEntry);
      }

      const embed = new EmbedBuilder()
        .setTitle('User Warned')
        .setColor('#fbbf24') // Warning amber
        .setDescription(`**User:** ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[Bot Command Error] Failed to log/execute warn command:', err.message);
      await interaction.reply({ content: 'Failed to warn user due to a database error.', flags: MessageFlags.Ephemeral });
    }
  }
};
