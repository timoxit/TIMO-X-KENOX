const express = require('express');
const router = express.Router();
const client = require('../../bot/client');
const { PermissionFlagsBits } = require('discord.js');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startBulkNickname, cancelBulkNickname, getBulkNicknameStatus } = require('../../bot/utils/bulkNickname');

const inviteCache = new Map();

// Guard middleware - admin only
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

router.use(authMiddleware);
router.use(adminOnly);

// Helper to get guild with fallback fetch
async function getGuild(guildId) {
  let guild = client.guilds.cache.get(guildId);
  if (!guild) {
    guild = await client.guilds.fetch(guildId).catch(() => null);
  }
  return guild;
}

// Helper to get guild and ensure bot member is cached
async function getGuildAndBot(guildId) {
  const guild = await getGuild(guildId);
  if (guild && client.user) {
    await guild.members.fetch(client.user.id).catch(() => null);
  }
  return guild;
}

// Setup multer for uploading server icon/banner
const uploadDir = path.join(__dirname, '../../../public/uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `admin-${file.fieldname}-${req.params.guildId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, GIF, and WEBP files are allowed.'));
    }
  }
});

// GET /guilds/:guildId - Get server details & channels
router.get('/guilds/:guildId', async (req, res) => {
  const { guildId } = req.params;
  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    // Force fetch channels to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    const channels = fetchedChannels
      .filter(c => c && (c.type === 0 || c.type === 2 || c.type === 4)) // Text = 0, Voice = 2, Category = 4
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId || null,
        position: c.position
      }));

    // Fetch or create invite URL
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
        console.error(`[Server Admin] Failed to fetch/create invite for guild ${guild.name} (${guild.id}):`, err.message);
      }
    }

    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 256 }) || null,
      banner: guild.bannerURL({ size: 1024 }) || null,
      channels: channels,
      inviteUrl: inviteUrl || null
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to get server settings for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch server data: ' + error.message });
  }
});

// POST /guilds/:guildId - Update server name, icon, banner
router.post('/guilds/:guildId', upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  const { guildId } = req.params;
  const { name } = req.body;
  
  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    // Update name if changed
    if (name && name !== guild.name) {
      await guild.setName(name);
    }

    // Update icon
    if (req.files && req.files['icon']) {
      const iconFile = req.files['icon'][0];
      try {
        await guild.setIcon(iconFile.path);
      } catch (iconErr) {
        throw new Error('Failed to update icon: ' + iconErr.message);
      } finally {
        if (fs.existsSync(iconFile.path)) fs.unlinkSync(iconFile.path);
      }
    }

    // Update banner
    if (req.files && req.files['banner']) {
      const bannerFile = req.files['banner'][0];
      try {
        await guild.setBanner(bannerFile.path);
      } catch (bannerErr) {
        throw new Error('Failed to update banner (Ensure server has enough boosts/banner privilege): ' + bannerErr.message);
      } finally {
        if (fs.existsSync(bannerFile.path)) fs.unlinkSync(bannerFile.path);
      }
    }

    res.json({
      message: 'Server settings updated successfully!',
      name: guild.name,
      icon: guild.iconURL({ size: 256 }) || null,
      banner: guild.bannerURL({ size: 1024 }) || null
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to update guild ${guildId}:`, error.message);
    res.status(500).json({ error: error.message || 'Failed to update server settings.' });
  }
});

// POST /guilds/:guildId/channels - Create a channel
router.post('/guilds/:guildId/channels', async (req, res) => {
  const { guildId } = req.params;
  const { name, type, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Channel name is required.' });
  }

  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const channelType = parseInt(type) === 2 ? 2 : (parseInt(type) === 4 ? 4 : 0);

    const options = {
      name,
      type: channelType
    };

    if (parentId) {
      options.parent = parentId;
    }

    const channel = await guild.channels.create(options);
    res.json({
      message: 'Channel created successfully!',
      channel: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId || null
      }
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to create channel in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to create channel: ' + error.message });
  }
});

// POST /guilds/:guildId/channels/:channelId - Update a channel
router.post('/guilds/:guildId/channels/:channelId', async (req, res) => {
  const { guildId, channelId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Channel name is required.' });
  }

  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }

    await channel.setName(name);
    res.json({
      message: 'Channel updated successfully!',
      channel: {
        id: channel.id,
        name: channel.name,
        type: channel.type
      }
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to rename channel ${channelId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to rename channel: ' + error.message });
  }
});

// DELETE /guilds/:guildId/channels/:channelId - Delete a channel
router.delete('/guilds/:guildId/channels/:channelId', async (req, res) => {
  const { guildId, channelId } = req.params;

  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }

    await channel.delete();
    res.json({ message: 'Channel deleted successfully!' });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to delete channel ${channelId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to delete channel: ' + error.message });
  }
});

// GET /guilds/:guildId/members - Get server members list
router.get('/guilds/:guildId/members', async (req, res) => {
  const { guildId } = req.params;
  const { query } = req.query;
  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    let fetchedMembers;
    if (query) {
      fetchedMembers = await guild.members.fetch({ query, limit: 50 });
    } else {
      fetchedMembers = await guild.members.fetch({ limit: 100 });
    }

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

    res.json(mappedMembers);
  } catch (error) {
    console.error(`[Server Admin Error] Failed to get members for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch members: ' + error.message });
  }
});

// POST /guilds/:guildId/members/:memberId/kick - Kick a member
router.post('/guilds/:guildId/members/:memberId/kick', async (req, res) => {
  const { guildId, memberId } = req.params;
  const { reason } = req.body;

  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const me = guild.members.me;
    if (!me || !me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return res.status(403).json({ error: 'Bot is missing the "Kick Members" permission in this server.' });
    }

    if (!member.kickable) {
      if (member.id === client.user.id) {
        return res.status(400).json({ error: 'Bot cannot kick itself.' });
      }
      if (member.id === guild.ownerId) {
        return res.status(403).json({ error: 'Bot cannot kick the server owner.' });
      }
      return res.status(403).json({ error: 'Bot cannot kick this member because their highest role is higher than or equal to the bot\'s highest role. Please move the bot\'s role higher in Discord Server Settings.' });
    }

    await member.kick(reason || 'Kicked from Admin Portal');
    res.json({ message: `Successfully kicked member ${member.displayName}` });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to kick member ${memberId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to kick member: ' + error.message });
  }
});

// POST /guilds/:guildId/members/:memberId/ban - Ban a member
router.post('/guilds/:guildId/members/:memberId/ban', async (req, res) => {
  const { guildId, memberId } = req.params;
  const { reason } = req.body;

  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const me = guild.members.me;
    if (!me || !me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return res.status(403).json({ error: 'Bot is missing the "Ban Members" permission in this server.' });
    }

    if (!member.bannable) {
      if (member.id === client.user.id) {
        return res.status(400).json({ error: 'Bot cannot ban itself.' });
      }
      if (member.id === guild.ownerId) {
        return res.status(403).json({ error: 'Bot cannot ban the server owner.' });
      }
      return res.status(403).json({ error: 'Bot cannot ban this member because their highest role is higher than or equal to the bot\'s highest role. Please move the bot\'s role higher in Discord Server Settings.' });
    }

    await member.ban({ reason: reason || 'Banned from Admin Portal', deleteMessageSeconds: 0 });
    res.json({ message: `Successfully banned member ${member.displayName}` });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to ban member ${memberId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to ban member: ' + error.message });
  }
});

// POST /guilds/:guildId/members/:memberId/timeout - Timeout a member
router.post('/guilds/:guildId/members/:memberId/timeout', async (req, res) => {
  const { guildId, memberId } = req.params;
  const { duration, reason } = req.body; // duration in minutes, null to remove

  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const me = guild.members.me;
    if (!me || !me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return res.status(403).json({ error: 'Bot is missing the "Timeout Members" (Moderate Members) permission in this server.' });
    }

    if (!member.moderatable) {
      if (member.id === client.user.id) {
        return res.status(400).json({ error: 'Bot cannot timeout itself.' });
      }
      if (member.id === guild.ownerId) {
        return res.status(403).json({ error: 'Bot cannot timeout the server owner.' });
      }
      if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return res.status(403).json({ error: 'Bot cannot timeout an Administrator (per Discord API rules).' });
      }
      return res.status(403).json({ error: 'Bot cannot timeout this member because their highest role is higher than or equal to the bot\'s highest role. Please move the bot\'s role higher in Discord Server Settings.' });
    }

    const timeoutDuration = duration ? parseInt(duration) * 60 * 1000 : null;
    await member.timeout(timeoutDuration, reason || (timeoutDuration ? 'Timed out from Admin Portal' : 'Timeout removed from Admin Portal'));

    res.json({
      message: timeoutDuration 
        ? `Successfully timed out ${member.displayName} for ${duration} minutes.`
        : `Successfully removed timeout for ${member.displayName}.`
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to timeout member ${memberId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to timeout member: ' + error.message });
  }
});

// POST /guilds/:guildId/members/:memberId/nickname - Change a member's nickname
router.post('/guilds/:guildId/members/:memberId/nickname', async (req, res) => {
  const { guildId, memberId } = req.params;
  const { nickname, reason } = req.body;

  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const isSelf = member.id === client.user.id;
    const me = guild.members.me;

    if (!isSelf) {
      if (member.id === guild.ownerId) {
        return res.status(403).json({ error: 'Bot cannot change the nickname of the server owner.' });
      }
      if (!me || !me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return res.status(403).json({ error: 'Bot is missing the "Manage Nicknames" permission in this server.' });
      }
      if (!member.manageable) {
        return res.status(403).json({ error: 'Bot cannot change this member\'s nickname because their highest role is higher than or equal to the bot\'s highest role. Please move the bot\'s role higher in Discord Server Settings.' });
      }
    } else {
      if (!me || !me.permissions.has(PermissionFlagsBits.ChangeNickname)) {
        return res.status(403).json({ error: 'Bot is missing the "Change Nickname" permission to change its own nickname.' });
      }
    }

    const nickToSet = nickname === undefined || nickname === null || nickname.trim() === '' ? null : nickname.trim();
    if (nickToSet && nickToSet.length > 32) {
      return res.status(400).json({ error: 'Nickname must be 32 characters or fewer.' });
    }

    await member.setNickname(nickToSet, reason || 'Changed from Admin Portal');

    res.json({
      message: nickToSet 
        ? `Successfully changed nickname of ${member.displayName} to ${nickToSet}.`
        : `Successfully reset nickname of ${member.displayName}.`,
      nickname: nickToSet
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to change nickname for member ${memberId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to change nickname: ' + error.message });
  }
});

// POST /guilds/:guildId/leave - Force bot to leave a guild
router.post('/guilds/:guildId/leave', async (req, res) => {
  const { guildId } = req.params;
  try {
    const guild = await getGuild(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    await guild.leave();
    res.json({ message: `Bot has successfully left ${guild.name}.` });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to leave guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to leave server: ' + error.message });
  }
});

// GET /guilds/:guildId/roles - Get server roles for role management
router.get('/guilds/:guildId/roles', async (req, res) => {
  const { guildId } = req.params;
  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
    const botHasManageRoles = me && me.permissions.has(PermissionFlagsBits.ManageRoles);
    const botHighestPosition = me ? me.roles.highest.position : 0;

    const fetchedRoles = await guild.roles.fetch();
    const sortedRoles = fetchedRoles
      .filter(r => r && r.name !== '@everyone' && !r.managed)
      .sort((a, b) => b.position - a.position)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        position: r.position,
        manageable: !!(botHasManageRoles && r.position < botHighestPosition)
      }));

    res.json(sortedRoles);
  } catch (error) {
    console.error(`[Server Admin Error] Failed to get roles for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch roles: ' + error.message });
  }
});

// PUT /guilds/:guildId/members/:memberId/roles - Update member roles
router.put('/guilds/:guildId/members/:memberId/roles', async (req, res) => {
  const { guildId, memberId } = req.params;
  const { roles: targetRoleIds, reason } = req.body;

  if (!Array.isArray(targetRoleIds)) {
    return res.status(400).json({ error: 'roles must be an array of role IDs.' });
  }

  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
    if (!me || !me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return res.status(403).json({ error: 'Bot is missing the "Manage Roles" permission in this server.' });
    }

    const botHighestPosition = me.roles.highest.position;

    // Fetch all guild roles to validate positions
    const guildRoles = await guild.roles.fetch();

    const currentRoleIds = member.roles.cache.map(r => r.id);
    const rolesToAdd = [];
    for (const roleId of targetRoleIds) {
      if (!currentRoleIds.includes(roleId)) {
        const role = guildRoles.get(roleId);
        if (role) {
          if (role.managed || role.name === '@everyone') continue;
          if (role.position >= botHighestPosition) {
            return res.status(403).json({ error: `Cannot add role "${role.name}" because it is equal to or higher than the bot's highest role.` });
          }
          rolesToAdd.push(role);
        }
      }
    }

    const rolesToRemove = [];
    const targetRoleIdSet = new Set(targetRoleIds);
    for (const roleId of currentRoleIds) {
      if (!targetRoleIdSet.has(roleId)) {
        const role = guildRoles.get(roleId);
        if (role) {
          if (role.managed || role.name === '@everyone') continue;
          if (role.position < botHighestPosition) {
            rolesToRemove.push(role);
          }
        }
      }
    }

    const optReason = reason || 'Updated from Admin Portal';
    
    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd, optReason);
    }
    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove, optReason);
    }

    const updatedMember = await member.fetch();
    const updatedRoles = updatedMember.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor }));

    res.json({
      message: `Successfully updated roles for ${member.displayName}`,
      roles: updatedRoles
    });
  } catch (error) {
    console.error(`[Server Admin Error] Failed to update roles for member ${memberId} in guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to update roles: ' + error.message });
  }
});

// GET /admin/users - Get all authorized users
router.get('/users', async (req, res) => {
  try {
    const AuthorizedUser = require('../../database/models/AuthorizedUser');
    const users = await AuthorizedUser.find().sort({ authorizedAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('[Admin API] Failed to fetch authorized users:', error.message);
    res.status(500).json({ error: 'Failed to fetch authorized users: ' + error.message });
  }
});

// PUT /admin/users/:userId - Update custom profile details of an authorized user
router.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { customNickname, customBio, notes, isAdmin } = req.body;
  try {
    const AuthorizedUser = require('../../database/models/AuthorizedUser');
    const updatedUser = await AuthorizedUser.findOneAndUpdate(
      { discordId: userId },
      {
        $set: {
          customNickname: customNickname !== undefined ? customNickname : '',
          customBio: customBio !== undefined ? customBio : '',
          notes: notes !== undefined ? notes : '',
          isAdmin: isAdmin !== undefined ? !!isAdmin : false
        }
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('[Admin API] Failed to update user profile:', error.message);
    res.status(500).json({ error: 'Failed to update user profile: ' + error.message });
  }
});

// DELETE /admin/users/:userId - Delete/revoke an authorized user record
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const AuthorizedUser = require('../../database/models/AuthorizedUser');
    const deletedUser = await AuthorizedUser.findOneAndDelete({ discordId: userId });
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User record removed successfully.' });
  } catch (error) {
    console.error('[Admin API] Failed to delete user profile:', error.message);
    res.status(500).json({ error: 'Failed to delete user profile: ' + error.message });
  }
});

// GET /admin/users/:userId/shared-guilds - Get servers that the bot shares with this user, and details
router.get('/users/:userId/shared-guilds', async (req, res) => {
  const { userId } = req.params;
  try {
    const sharedGuilds = [];
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (member) {
          sharedGuilds.push({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ size: 128 }) || null,
            nickname: member.nickname || null,
            roles: member.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
          });
        }
      } catch (memberErr) {
        // Skip guild if fetch failed
      }
    }
    res.json(sharedGuilds);
  } catch (error) {
    console.error('[Admin API] Failed to fetch shared guilds:', error.message);
    res.status(500).json({ error: 'Failed to fetch shared guilds: ' + error.message });
  }
});

// GET /guilds/:guildId/members/bulk-nickname/status - Get current bulk nickname job status
router.get('/guilds/:guildId/members/bulk-nickname/status', async (req, res) => {
  const { guildId } = req.params;
  try {
    const status = getBulkNicknameStatus(guildId);
    res.json(status);
  } catch (error) {
    console.error(`[Admin Route Error] Failed to get bulk nickname status for guild ${guildId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /guilds/:guildId/members/bulk-nickname - Trigger bulk nickname change
router.post('/guilds/:guildId/members/bulk-nickname', async (req, res) => {
  const { guildId } = req.params;
  const { template, casing, sourceNameType, reset } = req.body;
  try {
    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }
    const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
    if (!me || !me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return res.status(403).json({ error: 'Bot is missing the "Manage Nicknames" permission in this server.' });
    }

    const job = await startBulkNickname(client, guildId, { template, casing, sourceNameType, reset });
    res.json({ message: 'Bulk nickname process started successfully.', job });
  } catch (error) {
    console.error(`[Admin Route Error] Failed to start bulk nickname update for guild ${guildId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /guilds/:guildId/members/bulk-nickname/cancel - Cancel active bulk nickname change
router.post('/guilds/:guildId/members/bulk-nickname/cancel', async (req, res) => {
  const { guildId } = req.params;
  try {
    const cancelled = cancelBulkNickname(guildId);
    if (cancelled) {
      res.json({ message: 'Bulk nickname process cancelled successfully.' });
    } else {
      res.status(400).json({ error: 'No active bulk nickname process found to cancel.' });
    }
  } catch (error) {
    console.error(`[Admin Route Error] Failed to cancel bulk nickname process for guild ${guildId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
