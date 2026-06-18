const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  async execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setColor('#2563eb')
      .addFields(
        { name: 'User ID', value: target.id, inline: true },
        { name: 'Is Bot?', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: 'Created Account', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      );

    if (member) {
      const roles = member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => role.toString())
        .join(', ') || 'None';
      
      embed.addFields(
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Highest Role', value: member.roles.highest.toString(), inline: true },
        { name: 'Roles', value: roles }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
};
