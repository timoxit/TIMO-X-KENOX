const urlRegex = /(https?:\/\/[^\s]+)/gi;

/**
 * Checks if the message content contains a link that is not allowed.
 * @param {string} content Message content
 * @param {Array<string>} allowedLinks Allowed domains/links list
 * @returns {boolean} True if message has a forbidden link, False otherwise
 */
function hasForbiddenLink(content, allowedLinks = []) {
  const matches = content.match(urlRegex);
  if (!matches) return false;

  for (const match of matches) {
    try {
      const url = new URL(match);
      const hostname = url.hostname.toLowerCase();

      const isAllowed = allowedLinks.some(allowed => {
        const cleanAllowed = allowed.trim().toLowerCase();
        return hostname === cleanAllowed || hostname.endsWith('.' + cleanAllowed);
      });

      if (!isAllowed) {
        return true;
      }
    } catch (e) {
      const isAllowed = allowedLinks.some(allowed => 
        content.toLowerCase().includes(allowed.trim().toLowerCase())
      );
      if (!isAllowed) return true;
    }
  }

  return false;
}

module.exports = { hasForbiddenLink };
