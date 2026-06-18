require('dotenv').config();
const client = require('./bot/client');

client.once('ready', async () => {
  console.log(`[Test Members] Ready.`);
  
  const guildId = '1425815536939302924'; // TIMOXITER server from previous check
  const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
  
  if (!guild) {
    console.error(`Guild ${guildId} not found.`);
    process.exit(1);
  }
  
  try {
    console.log(`Fetching members...`);
    const fetchedMembers = await guild.members.fetch({ limit: 100 });
    console.log(`Fetched ${fetchedMembers.size} members.`);
    
    console.log(`Mapping members...`);
    const mappedMembers = fetchedMembers.map(m => {
      const isTimeouted = m.communicationDisabledUntil && m.communicationDisabledUntil > new Date();
      return {
        id: m.id,
        username: m.user.username,
        nickname: m.nickname || null,
        displayName: m.displayName,
        avatar: m.user.displayAvatarURL({ size: 128 }),
        roles: m.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
        kickable: m.kickable,
        bannable: m.bannable,
        moderatable: m.moderatable,
        manageable: m.manageable,
        isTimeouted: !!isTimeouted,
        timeoutUntil: isTimeouted ? m.communicationDisabledUntil : null,
        isBotSelf: m.id === client.user.id,
        isOwner: m.id === guild.ownerId
      };
    });
    
    console.log(`SUCCESS! Mapped ${mappedMembers.length} members:`);
    console.log(mappedMembers.slice(0, 3));
    
  } catch (err) {
    console.error(`ERROR occurred during mapping or fetching:`, err);
  }
  
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
