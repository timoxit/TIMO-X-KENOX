const socketIo = require('socket.io');
let io = null;

function initSocket(server, allowedOrigins) {
  io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(url => url && url.replace(/\/$/, "") === normalizedOrigin);
        
        if (isAllowed || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for a specific guild
    socket.on('join_guild', (guildId) => {
      socket.join(`guild_${guildId}`);
      console.log(`[Socket] Socket ${socket.id} joined room guild_${guildId}`);
    });

    socket.on('leave_guild', (guildId) => {
      socket.leave(`guild_${guildId}`);
      console.log(`[Socket] Socket ${socket.id} left room guild_${guildId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
