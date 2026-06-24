const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  ctx.restore();
}

function adjustColorBrightness(hex, percent) {
  let hexClean = hex.replace(/^\s*#|\s*$/g, '');
  if (hexClean.length === 3) {
    hexClean = hexClean.replace(/(.)/g, '$1$1');
  }

  let R = parseInt(hexClean.substring(0, 2), 16) || 0;
  let G = parseInt(hexClean.substring(2, 4), 16) || 0;
  let B = parseInt(hexClean.substring(4, 6), 16) || 0;

  R = Math.max(0, Math.min(255, parseInt(R + (percent * 255) / 100)));
  G = Math.max(0, Math.min(255, parseInt(G + (percent * 255) / 100)));
  B = Math.max(0, Math.min(255, parseInt(B + (percent * 255) / 100)));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

async function generatePollChart(poll) {
  const options = poll.options || [];
  const themeColor = poll.settings?.color || '#2563eb';
  
  // Calculate unique voters and max votes
  const allVoters = new Set();
  let maxVotes = 0;
  options.forEach(opt => {
    const count = opt.votes ? opt.votes.length : 0;
    if (count > maxVotes) {
      maxVotes = count;
    }
    if (opt.votes && Array.isArray(opt.votes)) {
      opt.votes.forEach(voterId => allVoters.add(voterId));
    }
  });
  const totalUniqueVoters = allVoters.size;

  // Temporary canvas to calculate text wrapping and dynamic height
  const tempCanvas = createCanvas(700, 200);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = 'bold 24px "Poppins", "Segoe UI", sans-serif';
  
  const questionLines = wrapText(tempCtx, poll.question, 640);
  const titleHeight = questionLines.length * 32;
  const topPadding = 40 + titleHeight + 20; // top padding + title height + margin
  const optionBlockHeight = 80;
  const bottomPadding = 60;
  
  const canvasHeight = topPadding + options.length * optionBlockHeight + bottomPadding;
  
  const canvas = createCanvas(700, canvasHeight);
  const ctx = canvas.getContext('2d');
  
  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 700, canvasHeight);
  
  // Subtle decorative borders
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.strokeRect(5, 5, 690, canvasHeight - 10);
  
  // Draw Question
  ctx.font = 'bold 24px "Poppins", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  questionLines.forEach((line, index) => {
    ctx.fillText(line, 30, 40 + index * 32);
  });
  
  // Draw Options
  options.forEach((opt, idx) => {
    const votesCount = opt.votes ? opt.votes.length : 0;
    let percentage = 0;
    if (totalUniqueVoters > 0) {
      percentage = Math.round((votesCount / totalUniqueVoters) * 100);
    }
    
    const isWinner = votesCount > 0 && votesCount === maxVotes;
    const yStart = topPadding + idx * optionBlockHeight;
    
    // Draw option name & percentage details
    ctx.font = '600 18px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#f3f4f6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    let optionLabel = `${idx + 1}. ${opt.text}`;
    if (optionLabel.length > 40) {
      optionLabel = optionLabel.substring(0, 37) + '...';
    }
    
    // Add crown emoji for winner in ended poll
    if (isWinner && poll.status === 'ended') {
      optionLabel = '👑 ' + optionLabel;
    }
    
    ctx.fillText(optionLabel, 30, yStart + 15);
    
    // Draw stats text on the right
    ctx.font = '500 16px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    if (isWinner && poll.status === 'ended') {
      ctx.fillStyle = '#facc15';
    } else {
      ctx.fillStyle = '#9ca3af';
    }
    
    const statsText = `${percentage}% (${votesCount} vote${votesCount === 1 ? '' : 's'})`;
    ctx.fillText(statsText, 670, yStart + 15);
    
    // Progress bar container
    const barX = 30;
    const barY = yStart + 35;
    const barW = 640;
    const barH = 20;
    const barR = 10;
    
    drawRoundedRect(ctx, barX, barY, barW, barH, barR, 'rgba(255, 255, 255, 0.08)');
    
    // Progress bar fill
    if (percentage > 0) {
      const fillW = Math.max(2 * barR, barW * (percentage / 100));
      
      const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      
      let startColor = themeColor;
      let endColor = adjustColorBrightness(themeColor, 20);
      
      if (isWinner && poll.status === 'ended') {
        startColor = '#eab308';
        endColor = '#facc15';
      }
      
      fillGrad.addColorStop(0, startColor);
      fillGrad.addColorStop(1, endColor);
      
      ctx.save();
      ctx.shadowColor = startColor;
      ctx.shadowBlur = 8;
      drawRoundedRect(ctx, barX, barY, fillW, barH, barR, fillGrad);
      ctx.restore();
    }
  });
  
  // Footer
  const footerY = canvasHeight - 35;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, footerY);
  ctx.lineTo(670, footerY);
  ctx.stroke();
  
  ctx.font = '500 13px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  const settingsParts = [];
  if (poll.settings?.anonymous) {
    settingsParts.push('Anonymous');
  } else {
    settingsParts.push('Public');
  }
  if (poll.settings?.multipleChoice) {
    settingsParts.push('Multiple Choice');
  } else {
    settingsParts.push('Single Choice');
  }
  
  const statusStr = poll.status === 'ended' ? 'ENDED' : 'ACTIVE';
  
  ctx.fillText(`Type: ${settingsParts.join(' • ')}  |  Status: ${statusStr}`, 30, footerY + 20);
  
  ctx.textAlign = 'right';
  ctx.fillText(`Total Voters: ${totalUniqueVoters}`, 670, footerY + 20);
  
  return canvas.encode('png');
}


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
  renderPollComponents,
  generatePollChart
};
