const path = require('path');
const dotenv = require('dotenv');
const result = dotenv.config({ path: path.join(__dirname, '../.env') });
const parsedEnv = result.parsed || {};

module.exports = {
  port: parsedEnv.PORT || process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  discordToken: process.env.DISCORD_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  discordRedirectUri: parsedEnv.DISCORD_REDIRECT_URI || process.env.DISCORD_REDIRECT_URI,
  jwtSecret: parsedEnv.JWT_SECRET || process.env.JWT_SECRET || 'super_secret_timoxiter_key_12345!',
  frontendUrl: parsedEnv.FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
};
