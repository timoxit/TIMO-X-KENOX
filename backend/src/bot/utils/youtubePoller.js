const GuildSettings = require('../../database/models/GuildSettings');
const client = require('../client');
const axios = require('axios');

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

async function checkYoutubeUploads() {
  try {
    // Find all guilds that have YouTube enabled
    const guildsWithYoutube = await GuildSettings.find({ 'youtube.enabled': true });
    if (guildsWithYoutube.length === 0) return;

    for (const settings of guildsWithYoutube) {
      const { channelId, targetChannelId, pingRoleId, messageTemplate, lastVideoId } = settings.youtube;
      if (!channelId || !targetChannelId) continue;

      try {
        // Fetch RSS feed
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const res = await axios.get(rssUrl, { 
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const xml = res.data;

        // Parse entry items from XML using regex
        const entries = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        while ((match = entryRegex.exec(xml)) !== null) {
          const entryContent = match[1];
          const videoIdMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
          const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
          const publishedMatch = entryContent.match(/<published>(.*?)<\/published>/);
          const authorMatch = entryContent.match(/<author>\s*<name>(.*?)<\/name>/);

          if (videoIdMatch) {
            entries.push({
              videoId: videoIdMatch[1],
              title: titleMatch ? decodeXmlEntities(titleMatch[1]) : '',
              url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
              published: publishedMatch ? new Date(publishedMatch[1]) : new Date(),
              author: authorMatch ? decodeXmlEntities(authorMatch[1]) : ''
            });
          }
        }

        if (entries.length === 0) continue;

        // Sort by publication date ascending (oldest first) so we process chronologically
        entries.sort((a, b) => a.published - b.published);

        // Get the latest video
        const latestVideo = entries[entries.length - 1];

        // If the latest video ID is different from lastVideoId, we have a new upload!
        let shouldAnnounce = false;

        // If lastVideoId is empty, it means this is the first run / channel newly connected.
        // We only announce if it is very recent (published within the last 24 hours).
        if (!lastVideoId) {
          const timeSincePublished = Date.now() - latestVideo.published.getTime();
          const isRecent = timeSincePublished < 24 * 60 * 60 * 1000; // 24 hours

          if (isRecent) {
            console.log(`[YouTube Poller] New channel connected. Latest video is recent (${Math.round(timeSincePublished / 60000)} mins old). Announcing: ${latestVideo.title}`);
            shouldAnnounce = true;
          } else {
            console.log(`[YouTube Poller] Initialized channel ${channelId} for guild ${settings.guildId} with older videoId: ${latestVideo.videoId}`);
            settings.youtube.lastVideoId = latestVideo.videoId;
            await settings.save();
            continue;
          }
        } else if (latestVideo.videoId !== lastVideoId) {
          shouldAnnounce = true;
        }

        if (shouldAnnounce) {
          console.log(`[YouTube Poller] New video found for guild ${settings.guildId}: ${latestVideo.title} (${latestVideo.videoId})`);

          const guild = client.guilds.cache.get(settings.guildId) || await client.guilds.fetch(settings.guildId).catch(() => null);
          if (guild) {
            const channel = guild.channels.cache.get(targetChannelId) || await guild.channels.fetch(targetChannelId).catch(() => null);
            if (channel) {
              // Construct announcement message
              let msgContent = messageTemplate || '{url}';
              
              // Automatically migrate/upgrade old default templates to only URL/preview
              if (msgContent === '**{channel}** just posted a new video: {url}') {
                msgContent = '{url}';
              }
              
              // Ensure the video URL is always included
              if (!/{url}/i.test(msgContent)) {
                msgContent = msgContent.trim() ? `${msgContent.trim()}\n{url}` : '{url}';
              }
              
              // Replace placeholders
              msgContent = msgContent
                .replace(/{channel}/gi, latestVideo.author || 'YouTube Channel')
                .replace(/{title}/gi, latestVideo.title || '')
                .replace(/{url}/gi, latestVideo.url || '');

              // Handle role ping prefix
              let pingPrefix = '';
              if (pingRoleId && pingRoleId !== 'none') {
                if (pingRoleId === 'everyone') {
                  pingPrefix = '@everyone ';
                } else if (pingRoleId === 'here') {
                  pingPrefix = '@here ';
                } else {
                  pingPrefix = `<@&${pingRoleId}> `;
                }
              }

              // Send the message to Discord
              await channel.send({
                content: `${pingPrefix}${msgContent}`.trim()
              });
              
              console.log(`[YouTube Poller] Sent upload announcement to channel ${targetChannelId} in guild ${settings.guildId}`);
            } else {
              console.warn(`[YouTube Poller] Target channel ${targetChannelId} not found in guild ${settings.guildId}`);
            }
          } else {
            console.warn(`[YouTube Poller] Guild ${settings.guildId} not found or bot not in it`);
          }

          // Update lastVideoId
          settings.youtube.lastVideoId = latestVideo.videoId;
          await settings.save();
        }
      } catch (err) {
        console.error(`[YouTube Poller Error] Failed checking channel ${channelId} for guild ${settings.guildId}:`, err.message);
      }
    }
  } catch (error) {
    console.error(`[YouTube Poller Critical Error]`, error.message);
  }
}

function startYoutubePoller() {
  console.log('[YouTube Poller] Starting YouTube RSS uploader checker (every 3 minutes)...');
  
  // Run once after a short delay (15 seconds) to let bot client connect/cache load
  setTimeout(() => {
    checkYoutubeUploads();
  }, 15000);

  // Poll every 3 minutes
  setInterval(() => {
    checkYoutubeUploads();
  }, 180000);
}

module.exports = { startYoutubePoller, checkYoutubeUploads };
