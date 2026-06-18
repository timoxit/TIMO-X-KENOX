require('dotenv').config();
const client = require('./bot/client');

client.once('ready', async () => {
  console.log(`[Test Bot] Logged in as ${client.user.tag}`);
  
  const guilds = client.guilds.cache;
  console.log(`[Test Bot] Bot is in ${guilds.size} servers:`);
  
  for (const [id, guild] of guilds) {
    console.log(`  - ${guild.name} (${id})`);
    try {
      console.log(`    Fetching members for ${guild.name}...`);
      const members = await guild.members.fetch({ limit: 10 });
      console.log(`    SUCCESS! Fetched ${members.size} members (limit 10).`);
    } catch (err) {
      console.error(`    FAILED to fetch members:`, err.message);
      if (err.message.includes('Privileged intent')) {
        console.error(`    -> SUGGESTION: You MUST enable the "SERVER MEMBERS INTENT" in the Discord Developer Portal under Bot settings!`);
      }
    }
  }
  
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('[Test Bot] Failed to login:', err.message);
  process.exit(1);
});
