const app = require('./server/app');
const http = require('http');
const { initBot } = require('./bot');
const connectDB = require('./database/connection');
const config = require('./config');
const { initSocket } = require('./server/socket');
const { loadFonts } = require('./bot/utils/fontLoader');
const { startAnnouncementScheduler } = require('./bot/utils/scheduler');
const { startYoutubePoller } = require('./bot/utils/youtubePoller');


const start = async () => {
  try {
    console.log('[App] Connecting to database...');
    await connectDB();

    console.log('[App] Downloading and registering fonts...');
    await loadFonts();

    console.log('[App] Starting Discord bot...');
    initBot();

    // Start scheduled announcement runner
    startAnnouncementScheduler();

    // Start YouTube uploads poller
    startYoutubePoller();

    console.log('[App] Detecting public IP...');
    try {
      const axios = require('axios');
      const ipRes = await axios.get('https://api.ipify.org?format=json');
      console.log(`[App] Web server public IP is: ${ipRes.data.ip}`);
    } catch (ipError) {
      console.log('[App] Could not detect public IP:', ipError.message);
    }

    const PORT = config.port;
    const server = http.createServer(app);
    
    // Initialize sockets
    initSocket(server, [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ]);

    server.listen(PORT, () => {
      console.log(`[App] Web server with Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[App] Critical failure starting the application:', error);
    process.exit(1);
  }
};

start();
