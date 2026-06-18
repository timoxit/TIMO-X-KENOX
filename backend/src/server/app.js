const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const guildsRouter = require('./routes/guilds');
const settingsRouter = require('./routes/settings');
const adminRouter = require('./routes/admin');
const config = require('../config');

const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowed = [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    // Normalize trailing slash if present
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowed.some(url => url && url.replace(/\/$/, "") === normalizedOrigin);
    
    if (isAllowed || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

app.use('/api/auth', authRouter);
app.use('/api/guilds', guildsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => {
  const client = require('../bot/client');
  res.json({ status: 'ok', botReady: client && client.readyAt ? true : false });
});

// Serve static frontend files if built
const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA routing: redirect all non-API/non-uploads/non-health paths to index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
