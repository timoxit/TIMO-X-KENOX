const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createProgressBar(percentage) {
  const totalBlocks = 10;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

/**
 * Generates a premium Discord embed representation of a poll.
 * @param {Object} poll - The database Poll document.
 * @param {Object} guild - The Discord.js Guild object.
 */
function renderPollEmbed(poll, guild) {
  const isEnded = poll.status === 'ended';
  const embed = new EmbedBuilder()
    .setTitle(`📊 Poll: ${poll.question}`)
    .setColor(poll.settings.color || '#2563eb')
    .setTimestamp();

  if (poll.description) {
    embed.setDescription(poll.description + '\n\n' + '—'.repeat(25));
  }

  // Calculate unique voters
  const allVoters = new Set();
  poll.options.forEach(opt => {
    if (opt.votes && Array.isArray(opt.votes)) {
      opt.votes.forEach(voterId => allVoters.add(voterId));
    }
  });
  const totalUniqueVoters = allVoters.size;

  let fieldsText = '';
  const showResults = isEnded || poll.settings.showResultsBeforeEnding;

  poll.options.forEach((opt, idx) => {
    const votesCount = opt.votes ? opt.votes.length : 0;
    let percentage = 0;
    if (totalUniqueVoters > 0) {
      percentage = Math.round((votesCount / totalUniqueVoters) * 100);
    }

    if (showResults) {
      const progressBar = createProgressBar(percentage);
      fieldsText += `**${idx + 1}. ${opt.text}**\n${progressBar} ${percentage}% (${votesCount} vote${votesCount === 1 ? '' : 's'})\n\n`;
    } else {
      fieldsText += `**${idx + 1}. ${opt.text}**\n\n`;
    }
  });

  if (!showResults) {
    fieldsText += `🗳️ *Results are hidden until the poll ends.*\n\n`;
  }

  embed.addFields({ name: 'Options', value: fieldsText || 'No options configured.' });

  // Add settings / details to footer
  const footerParts = [];
  if (poll.settings.anonymous) {
    footerParts.push('Anonymous Voting');
  } else {
    footerParts.push('Public Voting');
  }

  if (poll.settings.multipleChoice) {
    footerParts.push('Multiple Choice Allowed');
  } else {
    footerParts.push('Single Choice');
  }

  footerParts.push(`Total Voters: ${totalUniqueVoters}`);

  if (isEnded) {
    embed.setTitle(`📊 Ended Poll: ${poll.question}`);
    embed.setColor('#7f8c8d'); // neutral gray color for ended state
    footerParts.push('CLOSED');
  } else if (poll.settings.expiresAt) {
    const remainingMs = new Date(poll.settings.expiresAt) - new Date();
    if (remainingMs > 0) {
      footerParts.push(`Expires: ${new Date(poll.settings.expiresAt).toLocaleString()}`);
    } else {
      footerParts.push('CLOSED');
    }
  }

  embed.setFooter({
    text: footerParts.join(' • '),
    iconURL: guild ? guild.iconURL({ size: 128 }) || undefined : undefined
  });

  if (poll.settings.thumbnailUrl) {
    embed.setThumbnail(poll.settings.thumbnailUrl);
  }
  if (poll.settings.imageUrl) {
    embed.setImage(poll.settings.imageUrl);
  }

  return embed;
}

/**
 * Generates action row buttons for voting.
 * @param {Object} poll - The database Poll document.
 */
function renderPollComponents(poll) {
  const isEnded = poll.status === 'ended';
  const rows = [];
  let currentRow = new ActionRowBuilder();

  poll.options.forEach((opt, index) => {
    if (index > 0 && index % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }

    const button = new ButtonBuilder()
      .setCustomId(`pv_${poll._id}_${opt.id}`)
      .setLabel(opt.text.substring(0, 80))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(isEnded);

    currentRow.addComponents(button);
  });

  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

module.exports = {
  renderPollEmbed,
  renderPollComponents
};
