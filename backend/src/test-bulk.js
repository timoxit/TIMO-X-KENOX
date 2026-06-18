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
    const membersCollection = await guild.members.fetch();
    const targetMembers = Array.from(membersCollection.values()).filter(member => {
      if (member.id === client.user.id) return false;
      if (member.id === guild.ownerId) return false;
      return member.manageable;
    });

    console.log(`\n--- SIMULATION WITH displayName ---`);
    for (const member of targetMembers) {
      const sourceNameType = 'displayName';
      const casing = 'original';
      const template = 'TEST {DISPLAY_NAME}';
      
      const rawName = sourceNameType === 'username' ? member.user.username : member.displayName;
      let transformedName = rawName;
      
      if (casing === 'upper') {
        transformedName = rawName.toUpperCase();
      } else if (casing === 'lower') {
        transformedName = rawName.toLowerCase();
      }

      const nickToSet = template
        .replace(/\{username\}/gi, transformedName)
        .replace(/\{display_name\}/gi, transformedName);

      console.log(`Member: @${member.user.username} | DisplayName: ${member.displayName} -> Would set nickname to: "${nickToSet}"`);
    }

    console.log(`\n--- SIMULATION WITH username ---`);
    for (const member of targetMembers) {
      const sourceNameType = 'username';
      const casing = 'original';
      const template = 'TEST {USERNAME}';
      
      const rawName = sourceNameType === 'username' ? member.user.username : member.displayName;
      let transformedName = rawName;
      
      if (casing === 'upper') {
        transformedName = rawName.toUpperCase();
      } else if (casing === 'lower') {
        transformedName = rawName.toLowerCase();
      }

      const nickToSet = template
        .replace(/\{username\}/gi, transformedName)
        .replace(/\{display_name\}/gi, transformedName);

      console.log(`Member: @${member.user.username} | DisplayName: ${member.displayName} -> Would set nickname to: "${nickToSet}"`);
    }

  } catch (err) {
    console.error('Error during simulation:', err);
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
