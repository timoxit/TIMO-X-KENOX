const axios = require('axios');

async function testResolver(inputUrl) {
  let targetUrl = inputUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    if (targetUrl.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${targetUrl}`;
    } else {
      targetUrl = `https://www.youtube.com/@${targetUrl}`;
    }
  }

  console.log(`Resolving URL: ${targetUrl}`);
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 6000
    });

    const html = response.data;
    
    // Find all UC... patterns to see if any channel ID is there
    const ucMatches = html.match(/UC[a-zA-Z0-9_-]{22}/g);
    console.log(`Found UC matches count: ${ucMatches ? ucMatches.length : 0}`);
    if (ucMatches) {
      console.log('Sample of UC matches:', [...new Set(ucMatches)].slice(0, 5));
    }

    let channelIdMatch = html.match(/<meta itemprop="channelId" content="(UC[a-zA-Z0-9_-]{22})"/);
    if (!channelIdMatch) {
      channelIdMatch = html.match(/"channelId"\s*:\s*"(UC[a-zA-Z0-9_-]{22})"/);
    }
    if (!channelIdMatch) {
      // Try a wider regex match for the channel URL or canonical URL
      channelIdMatch = html.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
    }
    if (!channelIdMatch) {
      // Try searching for tag properties or schemas
      channelIdMatch = html.match(/meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/i);
    }
    if (!channelIdMatch && ucMatches && ucMatches.length > 0) {
      // Fallback: pick the first recurring UC matches
      channelIdMatch = [null, ucMatches[0]];
    }

    if (!channelIdMatch) {
      console.log('FAILED: Could not find channel ID in HTML.');
      // Print first 500 characters of head to see what HTML looks like
      console.log('HTML preview:', html.substring(0, 1000));
      return;
    }

    const channelId = channelIdMatch[1];
    
    let channelName = '';
    const titleMatch = html.match(/<meta itemprop="name" content="([^"]+)"/);
    if (titleMatch) {
      channelName = titleMatch[1];
    } else {
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (ogTitleMatch) {
        channelName = ogTitleMatch[1];
      }
    }

    console.log(`SUCCESS: Resolved Channel ID: ${channelId}, Channel Name: ${channelName}`);
    return channelId;
  } catch (err) {
    console.error(`FAILED: ${err.message}`);
  }
}

async function testRss(channelId) {
  if (!channelId) return;
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log(`Fetching RSS: ${rssUrl}`);
  try {
    const res = await axios.get(rssUrl, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const xml = res.data;

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
          title: titleMatch ? titleMatch[1] : '',
          url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
          published: publishedMatch ? new Date(publishedMatch[1]) : new Date(),
          author: authorMatch ? authorMatch[1] : ''
        });
      }
    }

    console.log(`SUCCESS: Parsed ${entries.length} videos from RSS.`);
    if (entries.length > 0) {
      console.log('Latest Video details:', entries[entries.length - 1]);
    }
  } catch (err) {
    console.error(`FAILED to fetch RSS: ${err.message}`);
  }
}

async function run() {
  const channelId = await testResolver('@GoogleDeepMind');
  await testRss(channelId);
}

run();
