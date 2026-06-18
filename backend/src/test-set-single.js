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
    const members = await guild.members.fetch();
    // Find member timo_xit (ID or username)
    const member = members.find(m => m.user.username === 'timo_xit');
    
    if (!member) {
      console.error('Member @timo_xit not found.');
      process.exit(1);
    }

    console.log(`Found member: @${member.user.username}`);
    console.log(`Current Nickname: ${member.nickname}`);
    console.log(`Current member.displayName: ${member.displayName}`);
    console.log(`Current member.user.displayName: ${member.user.displayName}`);

    const sourceNameType = 'displayName';
    const casing = 'original';
    const template = '{DISPLAY_NAME}';

    const rawName = sourceNameType === 'username' ? member.user.username : member.user.displayName;
    let transformedName = rawName;

    if (casing === 'upper') {
      transformedName = rawName.toUpperCase();
    } else if (casing === 'lower') {
      transformedName = rawName.toLowerCase();
    }

    const nickToSet = template
      .replace(/\{username\}/gi, transformedName)
      .replace(/\{display_name\}/gi, transformedName);

    console.log(`Setting nickname to: "${nickToSet}"`);
    await member.setNickname(nickToSet, 'Test single nickname change');
    console.log('SUCCESS! Nickname set successfully.');

  } catch (err) {
    console.error('Error setting nickname:', err.message);
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
