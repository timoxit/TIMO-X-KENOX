const { MessageFlags, AttachmentBuilder } = require('discord.js');
const Poll = require('../../database/models/Poll');
const { renderPollEmbed, renderPollComponents, generatePollChart } = require('../utils/pollHelper');
const { getIo } = require('../../server/socket');

module.exports = {
  name: 'poll',
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const optionsRaw = interaction.options.getString('options');

    // Parse options
    const options = optionsRaw
      .split(',')
      .map(opt => opt.trim())
      .filter(Boolean);

    if (options.length < 2) {
      return interaction.reply({
        content: '❌ A poll must have at least 2 options! Separate them with commas (e.g. Yes, No).',
        flags: MessageFlags.Ephemeral
      });
    }

    if (options.length > 10) {
      return interaction.reply({
        content: '❌ A poll can have a maximum of 10 options.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Acknowledge defer if database operations take a moment
    await interaction.deferReply();

    try {
      const guildId = interaction.guildId;
      const channelId = interaction.channelId;
      
      const pollOptions = options.map((optText, index) => ({
        id: `opt_${index}`,
        text: optText,
        votes: []
      }));

      // Create poll object in MongoDB
      const poll = new Poll({
        guildId,
        channelId,
        messageId: 'TEMP', // Will fill in once reply is sent
        question: question.trim(),
        options: pollOptions,
        settings: {
          multipleChoice: false,
          anonymous: false,
          showResultsBeforeEnding: true,
          color: '#2563eb'
        },
        status: 'active',
        creatorId: interaction.user.id
      });

      const embed = renderPollEmbed(poll, interaction.guild);
      const components = renderPollComponents(poll);

      const payload = { embeds: [embed], components: components };
      const showResults = poll.status === 'ended' || poll.settings.showResultsBeforeEnding;
      if (showResults) {
        const chartBuffer = await generatePollChart(poll);
        const attachmentName = `poll_chart_${Date.now()}.png`;
        embed.setImage(`attachment://${attachmentName}`);
        const attachment = new AttachmentBuilder(chartBuffer, { name: attachmentName });
        payload.files = [attachment];
      }

      // Send poll
      const replyMessage = await interaction.editReply(payload);

      // Update message ID
      poll.messageId = replyMessage.id;
      await poll.save();

      // Emit Socket.io update
      const io = getIo();
      if (io) {
        io.to(`guild_${guildId}`).emit('poll_update', poll);
      }
    } catch (error) {
      console.error('[Bot Commands] Error creating quick slash poll:', error);
      await interaction.editReply({
        content: '❌ Failed to create poll: ' + error.message
      });
    }
  }
};
