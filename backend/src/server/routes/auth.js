const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const AuthorizedUser = require('../../database/models/AuthorizedUser');

// Get the Discord OAuth2 URL
router.get('/discord-url', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${encodeURIComponent(config.discordRedirectUri)}&response_type=code&scope=identify%20guilds`;
  res.json({ url });
});

// Exchange code for JWT
router.post('/exchange', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: config.discordClientId,
        client_secret: config.discordClientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.discordRedirectUri,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const user = userResponse.data;

    // Save/update the authorized user in database
    await AuthorizedUser.findOneAndUpdate(
      { discordId: user.id },
      {
        username: user.username,
        discriminator: user.discriminator || '',
        avatar: user.avatar || '',
        authorizedAt: new Date()
      },
      { upsert: true, new: true }
    ).catch(err => console.error('[Auth] Failed to save authorized user:', err.message));

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        accessToken: access_token,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator,
      },
    });
  } catch (error) {
    console.error('[Server Auth Error] OAuth2 Exchange failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with Discord' });
  }
});

// Admin Login Route
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const name = "Timoyztimoyz's Application";
    const ownerid = "3P4btfp4Nl";
    const version = "1.0";
    const secret = "919700000b66211117822556b95891d25109bc7b88ad9a6a990abd51a96296d2";

    // 1. Initialize session with KeyAuth API 1.2
    const initUrl = `https://keyauth.win/api/1.2/?type=init&name=${encodeURIComponent(name)}&ownerid=${ownerid}&version=${version}&secret=${secret}`;
    const initRes = await axios.get(initUrl, { timeout: 5000 });

    if (!initRes.data || !initRes.data.success) {
      return res.status(401).json({ error: initRes.data?.message || 'KeyAuth initialization failed.' });
    }

    const sessionid = initRes.data.sessionid;

    // 2. Validate login credentials (username and password) with KeyAuth API 1.2
    const hwid = "timoxiter_dashboard_server";
    const loginUrl = `https://keyauth.win/api/1.2/?type=login&username=${encodeURIComponent(username)}&pass=${encodeURIComponent(password)}&sessionid=${sessionid}&name=${encodeURIComponent(name)}&ownerid=${ownerid}&secret=${secret}&hwid=${hwid}`;
    const loginRes = await axios.get(loginUrl, { timeout: 5000 });

    if (!loginRes.data || !loginRes.data.success) {
      return res.status(401).json({ error: loginRes.data?.message || 'Invalid admin credentials.' });
    }

    // Success - sign JWT token with the validated KeyAuth username
    const token = jwt.sign(
      {
        id: 'admin',
        username: username,
        isAdmin: true,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: 'admin',
        username: username,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error('[KeyAuth Login Error] Validation failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Authentication service is offline or timed out. Please try again later.' });
  }
});

module.exports = router;
