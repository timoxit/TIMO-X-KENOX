const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Logged in as ${client.user.tag}!`);
    
    const commands = [
      new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about a user')
        .addUserOption(option => 
          option.setName('target')
            .setDescription('The user to get info about')
            .setRequired(false)
        ),
      new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Shows information about the server'),
      new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Get the link to the dashboard website'),
      new SlashCommandBuilder()
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
        ),
      new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears messages sent by this bot from this chat')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Number of messages to search through (default: 50, max: 100)')
            .setRequired(false)
        )
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(config.discordToken);

    try {
      console.log('[Bot] Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('[Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Bot] Error reloading application (/) commands:', error);
    }
  }
};
