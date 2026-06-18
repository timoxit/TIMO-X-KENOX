const socketIo = require('socket.io');
let io = null;

function initSocket(server, allowedOrigins) {
  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
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
