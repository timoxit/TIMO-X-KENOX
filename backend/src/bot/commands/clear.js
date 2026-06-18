const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears messages sent by this bot from this chat')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to search through (default: 50, max: 100)')
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const amount = interaction.options.getInteger('amount') || 50;
    const limit = Math.max(1, Math.min(amount, 100));
    const channel = interaction.channel;

    try {
      const messages = await channel.messages.fetch({ limit });
      // Filter for messages sent by the bot itself
      const botMessages = messages.filter(msg => msg.author.id === interaction.client.user.id);

      if (botMessages.size === 0) {
        return await interaction.editReply({ content: `No bot messages found to clear in the last ${limit} messages.` });
      }

      await interaction.editReply({ content: `Found ${botMessages.size} bot messages. Deleting...` });

      let deletedCount = 0;
      for (const msg of botMessages.values()) {
        try {
          if (msg.deletable) {
            await msg.delete();
            deletedCount++;
          }
        } catch (err) {
          console.error(`[Clear Command] Failed to delete message ${msg.id}:`, err.message);
        }
      }

      await interaction.editReply({ content: `Successfully deleted ${deletedCount} bot messages from this chat.` });
    } catch (error) {
      console.error('[Clear Command] Error clearing messages:', error);
      await interaction.editReply({ content: `Failed to clear bot messages: ${error.message}` });
    }
  }
};
