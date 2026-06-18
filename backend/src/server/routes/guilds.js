const express = require('express');
const router = express.Router();
const axios = require('axios');
const client = require('../../bot/client');
const config = require('../../config');
const authMiddleware = require('../middleware/auth');
const { PermissionFlagsBits } = require('discord.js');

const guildCache = new Map();
const inviteCache = new Map();
const CACHE_TTL = 15000; // Cache for 15 seconds

// Get all guilds user is in, and whether the bot is added
router.get('/', authMiddleware, async (req, res) => {
  if (req.user && req.user.isAdmin) {
    const mappedGuilds = await Promise.all(client.guilds.cache.map(async (guild) => {
      let inviteUrl = inviteCache.get(guild.id);
      
      if (!inviteUrl) {
        try {
          let inviteChannel = guild.systemChannel;
          const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
          
          if (me) {
            if (!inviteChannel || !inviteChannel.permissionsFor(me)?.has(PermissionFlagsBits.CreateInstantInvite)) {
              inviteChannel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(me)?.has(PermissionFlagsBits.CreateInstantInvite));
            }
            
            if (inviteChannel) {
              const invite = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0, reason: 'TIMOXITER Admin Portal Invite Copy' }).catch(() => null);
              if (invite) {
                inviteUrl = invite.url;
                inviteCache.set(guild.id, inviteUrl);
              }
            }
          }
          
          // Fallback to fetch invites if create didn't work
          if (!inviteUrl) {
            const invites = await guild.invites.fetch().catch(() => null);
            if (invites && invites.size > 0) {
              inviteUrl = invites.first().url;
              inviteCache.set(guild.id, inviteUrl);
            }
          }
        } catch (err) {
          console.error(`[Server Guilds] Failed to fetch/create invite for guild ${guild.name} (${guild.id}):`, err.message);
        }
      }

      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        botInGuild: true,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        joinedAt: guild.joinedAt,
        inviteUrl: inviteUrl || null
      };
    }));
    
    return res.json(mappedGuilds);
  }

  const userId = req.user.id;
  const now = Date.now();
  const cached = guildCache.get(userId);

  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.guilds);
  }

  try {
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`
      }
    });

    const userGuilds = response.data;
    
    const adminGuilds = userGuilds.filter(guild => {
      const perms = BigInt(guild.permissions);
      return (perms & 0x8n) === 0x8n;
    });

    const mappedGuilds = adminGuilds.map(guild => {
      const botInGuild = client.guilds.cache.has(guild.id);
      
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        botInGuild,
        inviteUrl: botInGuild ? null : `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`
      };
    });

    // Save to cache
    guildCache.set(userId, {
      guilds: mappedGuilds,
      timestamp: now
    });

    res.json(mappedGuilds);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`[Server Guilds] Rate limited by Discord. Retry-After: ${retryAfter}s`);
      
      // Fallback: If we have an expired cache, return it rather than showing an error!
      if (cached) {
        console.log(`[Server Guilds] Returning expired cache as fallback for user ${userId}`);
        return res.json(cached.guilds);
      }

      return res.status(429).json({ 
        error: `Discord is rate-limiting requests right now. Please wait ${retryAfter} seconds and try again.` 
      });
    }

    console.error('[Server Guilds Error] Failed to fetch guilds:', error.message);
    res.status(500).json({ error: 'Failed to fetch guilds from Discord' });
  }
});

// Get channels of a guild
router.get('/:guildId/channels', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter text channels only (ChannelType.GuildText = 0)
    const channels = fetchedChannels
      .filter(c => c && c.type === 0)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(channels);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get channels for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get roles of a guild
router.get('/:guildId/roles', authMiddleware, async (req, res) => {
  const { guildId } = req.params;

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    const fetchedRoles = await guild.roles.fetch();

    const roles = fetchedRoles
      .filter(r => r && r.name !== '@everyone' && !r.managed)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor
      }));

    res.json(roles);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get roles for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get categories of a guild
router.get('/:guildId/categories', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter category channels only (ChannelType.GuildCategory = 4)
    const categories = fetchedChannels
      .filter(c => c && c.type === 4)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(categories);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get categories for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get voice channels of a guild
router.get('/:guildId/voice-channels', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter voice channels only (ChannelType.GuildVoice = 2)
    const voiceChannels = fetchedChannels
      .filter(c => c && c.type === 2)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(voiceChannels);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get voice channels for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch voice channels' });
  }
});

module.exports = router;
