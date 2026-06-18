const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'dashboard',
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('TIMOXITER Dashboard')
      .setDescription('Click the button below to visit the TIMOXITER web control panel and customize your server settings.')
      .setColor('#2563eb')
      .setThumbnail(interaction.client.user.displayAvatarURL());

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Open Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL(config.frontendUrl)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
