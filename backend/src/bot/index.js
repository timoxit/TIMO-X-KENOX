const client = require('./client');
const config = require('../config');
const fs = require('fs');
const path = require('path');

function initBot() {
  console.log('[Bot] Initializing event handlers...');

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[Bot] Registered event: ${event.name}`);
  }

  if (config.discordToken) {
    client.login(config.discordToken).catch(err => {
      console.error('[Bot] Failed to log in to Discord. Check your token:', err.message);
    });
  } else {
    console.warn('[Bot] DISCORD_TOKEN is missing. Bot will not run.');
  }
}

module.exports = { initBot };
