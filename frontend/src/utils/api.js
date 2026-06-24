const API_URL = window.location.port === '5173' || window.location.port === '5174'
  ? 'http://localhost:1816/api'
  : '/api';

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('timoxiter_token', token);
  } else {
    localStorage.removeItem('timoxiter_token');
  }
};

export const getToken = () => {
  return localStorage.getItem('timoxiter_token');
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem('timoxiter_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('timoxiter_user');
  }
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('timoxiter_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  getDiscordAuthUrl: () => request('/auth/discord-url'),
  exchangeCode: (code) => request('/auth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),
  adminLogin: (username, password) => request('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getGuilds: () => request('/guilds'),
  getChannels: (guildId) => request(`/guilds/${guildId}/channels`),
  getRoles: (guildId) => request(`/guilds/${guildId}/roles`),
  getSettings: (guildId) => request(`/settings/${guildId}`),
  saveSettings: (guildId, settings) => request(`/settings/${guildId}`, {
    method: 'POST',
    body: JSON.stringify(settings)
  }),
  publishVerification: (guildId) => request(`/settings/${guildId}/verification-embed`, {
    method: 'POST'
  }),
  getLogs: (guildId) => request(`/settings/${guildId}/logs`),
  sendMassDM: (guildId, data) => request(`/settings/${guildId}/mass-dm`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  sendChannelMessage: (guildId, data) => request(`/settings/${guildId}/channel-message`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getBroadcasts: (guildId) => request(`/settings/${guildId}/broadcasts`),
  revokeBroadcast: (guildId, broadcastId) => request(`/settings/${guildId}/broadcasts/${broadcastId}/revoke`, {
    method: 'POST'
  }),
  cancelBroadcast: (guildId, broadcastId) => request(`/settings/${guildId}/broadcasts/${broadcastId}/cancel`, {
    method: 'POST'
  }),
  getTemplates: (guildId, type) => request(`/settings/${guildId}/templates${type ? `?type=${type}` : ''}`),
  saveTemplate: (guildId, templateData) => request(`/settings/${guildId}/templates`, {
    method: 'POST',
    body: JSON.stringify(templateData)
  }),
  deleteTemplate: (guildId, templateId) => request(`/settings/${guildId}/templates/${templateId}`, {
    method: 'DELETE'
  }),
  getScheduledAnnouncements: (guildId) => request(`/settings/${guildId}/scheduled`),
  scheduleAnnouncement: (guildId, data) => request(`/settings/${guildId}/scheduled`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteScheduledAnnouncement: (guildId, announcementId) => request(`/settings/${guildId}/scheduled/${announcementId}`, {
    method: 'DELETE'
  }),
  getScheduledDMs: (guildId) => request(`/settings/${guildId}/scheduled-dms`),
  scheduleDM: (guildId, data) => request(`/settings/${guildId}/scheduled-dms`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteScheduledDM: (guildId, id) => request(`/settings/${guildId}/scheduled-dms/${id}`, {
    method: 'DELETE'
  }),
  sendTestDM: (guildId, data) => request(`/settings/${guildId}/mass-dm/test`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  uploadBackground: (guildId, file, cropParams = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (cropParams.cropX !== undefined) formData.append('cropX', cropParams.cropX);
    if (cropParams.cropY !== undefined) formData.append('cropY', cropParams.cropY);
    if (cropParams.cropWidth !== undefined) formData.append('cropWidth', cropParams.cropWidth);
    if (cropParams.cropHeight !== undefined) formData.append('cropHeight', cropParams.cropHeight);

    const token = getToken();
    return fetch(`${API_URL}/settings/${guildId}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'File upload failed.');
      }
      return res.json();
    });
  },
  getCategories: (guildId) => request(`/guilds/${guildId}/categories`),
  getVoiceChannels: (guildId) => request(`/guilds/${guildId}/voice-channels`),
  publishTickets: (guildId) => request(`/settings/${guildId}/tickets-embed`, {
    method: 'POST'
  }),
  getAdminGuildDetails: (guildId) => request(`/admin/guilds/${guildId}`),
  updateAdminGuildDetails: (guildId, formData) => {
    const token = getToken();
    return fetch(`${API_URL}/admin/guilds/${guildId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update server settings.');
      }
      return res.json();
    });
  },
  renameChannel: (guildId, channelId, name) => request(`/admin/guilds/${guildId}/channels/${channelId}`, {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  createChannel: (guildId, name, type, parentId = null) => request(`/admin/guilds/${guildId}/channels`, {
    method: 'POST',
    body: JSON.stringify({ name, type, parentId })
  }),
  deleteChannel: (guildId, channelId) => request(`/admin/guilds/${guildId}/channels/${channelId}`, {
    method: 'DELETE'
  }),
  getAdminMembers: (guildId, search = '') => request(`/admin/guilds/${guildId}/members${search ? `?query=${encodeURIComponent(search)}` : ''}`),
  kickMember: (guildId, memberId, reason = '') => request(`/admin/guilds/${guildId}/members/${memberId}/kick`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  banMember: (guildId, memberId, reason = '') => request(`/admin/guilds/${guildId}/members/${memberId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  timeoutMember: (guildId, memberId, duration, reason = '') => request(`/admin/guilds/${guildId}/members/${memberId}/timeout`, {
    method: 'POST',
    body: JSON.stringify({ duration, reason })
  }),
  changeNickname: (guildId, memberId, nickname, reason = '') => request(`/admin/guilds/${guildId}/members/${memberId}/nickname`, {
    method: 'POST',
    body: JSON.stringify({ nickname, reason })
  }),
  getAdminGuildRoles: (guildId) => request(`/admin/guilds/${guildId}/roles`),
  updateMemberRoles: (guildId, memberId, roles, reason = '') => request(`/admin/guilds/${guildId}/members/${memberId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roles, reason })
  }),
  startBulkNickname: (guildId, data) => request(`/admin/guilds/${guildId}/members/bulk-nickname`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getBulkNicknameStatus: (guildId) => request(`/admin/guilds/${guildId}/members/bulk-nickname/status`),
  cancelBulkNickname: (guildId) => request(`/admin/guilds/${guildId}/members/bulk-nickname/cancel`, {
    method: 'POST'
  }),
  leaveGuild: (guildId) => request(`/admin/guilds/${guildId}/leave`, {
    method: 'POST'
  }),
  getAuthorizedUsers: () => request('/admin/users'),
  updateAuthorizedUser: (userId, data) => request(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAuthorizedUser: (userId) => request(`/admin/users/${userId}`, {
    method: 'DELETE'
  }),
  getSharedGuilds: (userId) => request(`/admin/users/${userId}/shared-guilds`),
  resolveYoutubeChannel: (guildId, url) => request(`/settings/${guildId}/youtube/resolve`, {
    method: 'POST',
    body: JSON.stringify({ url })
  }),
  getPolls: (guildId) => request(`/polls/${guildId}`),
  createPoll: (guildId, data) => request(`/polls/${guildId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  endPoll: (guildId, pollId) => request(`/polls/${guildId}/${pollId}/end`, {
    method: 'POST'
  }),
  deletePoll: (guildId, pollId) => request(`/polls/${guildId}/${pollId}`, {
    method: 'DELETE'
  })
};

