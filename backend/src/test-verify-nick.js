require('dotenv').config();
const client = require('./bot/client');

client.once('ready', async () => {
  const guildId = '1425815536939302924'; // TIMOXITER server
  const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);

  if (!guild) {
    console.error(`Guild ${guildId} not found.`);
    process.exit(1);
  }

  try {
    console.log(`Guild: ${guild.name}`);
    const members = await guild.members.fetch();
    console.log(`Total fetched members: ${members.size}`);

    for (const [id, member] of members) {
      console.log(`User: @${member.user.username} | Nickname: ${member.nickname} | Display: ${member.displayName} | Owner: ${id === guild.ownerId}`);
    }
  } catch (err) {
    console.error('Error fetching members:', err);
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
