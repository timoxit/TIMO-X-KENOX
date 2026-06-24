import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { io } from 'socket.io-client';
import CropModal from '../components/CropModal';
import AdminServerSettings from '../components/AdminServerSettings';
import { 
  Shield, 
  UserCheck, 
  Sparkles, 
  MessageSquare, 
  Info, 
  ChevronLeft, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Send,
  Megaphone,
  Ticket,
  Trash2,
  Server,
  Edit3,
  Plus,
  Video,
  BarChart2
} from 'lucide-react';


const Youtube = ({ size = 24, className = '', style = {} }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    style={style}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.969.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.389-.507a3.007 3.007 0 0 0 2.11-2.11C24 15.969 24 12 24 12s0-3.969-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);


// Discord Message Preview Component
function DiscordMessagePreview({ 
  botUser, 
  guildName, 
  guildIcon, 
  message, 
  buttonEnabled, 
  buttonLabel, 
  embedEnabled, 
  embedTitle, 
  embedDesc, 
  embedColor, 
  embedThumb, 
  embedImage,
  isDM = false,
  // New props for expanded announcement features:
  pingType = 'none',
  pingRoleId = '',
  roles = [],
  embedAuthorEnabled = false,
  embedAuthorName = '',
  embedAuthorIcon = '',
  embedAuthorUrl = '',
  embedFooterEnabled = false,
  embedFooterText = '',
  embedFooterIcon = '',
  embedFields = [],
  buttons = []
}) {
  // Resolve placeholders
  const resolvePlaceholders = (text) => {
    if (!text) return '';
    return text
      .replace(/{username}/g, botUser?.username || 'Member')
      .replace(/{server}/g, guildName || 'Server');
  };

  // Prepend source header if it's a DM
  let contentText = resolvePlaceholders(message);
  if (isDM) {
    if (contentText) {
      contentText = `Sent from: **${guildName}**\n\n` + contentText;
    } else {
      contentText = `Sent from: **${guildName}**`;
    }
  }

  // Parse markdown bold **text** to <strong> tags for visual correctness
  const formatMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const botAvatar = botUser?.avatar 
    ? `https://cdn.discordapp.com/avatars/${botUser.id}/${botUser.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  // Construct Ping mention preview node
  let pingPrefixNode = null;
  if (!isDM && pingType && pingType !== 'none') {
    let pingText = '';
    let pingColor = '#c9cdfb';
    if (pingType === 'everyone') {
      pingText = '@everyone';
    } else if (pingType === 'here') {
      pingText = '@here';
    } else if (pingType === 'role' && pingRoleId) {
      const targetRole = roles?.find(r => r.id === pingRoleId);
      pingText = targetRole ? `@${targetRole.name}` : '@deleted-role';
      if (targetRole && targetRole.color && targetRole.color !== '#000000') {
        pingColor = targetRole.color;
      }
    }

    if (pingText) {
      pingPrefixNode = (
        <span style={{ 
          backgroundColor: 'rgba(88, 101, 242, 0.3)', 
          color: pingColor, 
          padding: '0 4px', 
          borderRadius: '3px', 
          fontWeight: '500',
          marginRight: '6px',
          fontSize: '0.9rem',
          userSelect: 'none'
        }}>
          {pingText}
        </span>
      );
    }
  }

  return (
    <div style={{
      backgroundColor: '#313338',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      color: '#dbdee1',
      fontSize: '0.95rem',
      lineHeight: '1.375rem',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      userSelect: 'none',
      width: '100%',
      maxWidth: '520px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <img 
          src={botAvatar} 
          alt="Avatar" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}
        />
        
        {/* Message body container */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', color: '#f2f3f5', fontSize: '1rem' }}>
              TIMO X MODE
            </span>
            <span style={{
              backgroundColor: '#5865F2',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: '700',
              padding: '1px 4px',
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: '0.8rem',
              height: '14px'
            }}>
              BOT
            </span>
            <span style={{ fontSize: '0.75rem', color: '#949ba4', marginLeft: '4px' }}>
              Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message Content Text (including Ping badge) */}
          {(pingPrefixNode || contentText) && (
            <div style={{ color: '#dbdee1', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '4px', fontSize: '0.9375rem' }}>
              {pingPrefixNode}
              {formatMarkdown(contentText)}
            </div>
          )}

          {/* Embed Card */}
          {embedEnabled && (embedTitle || embedDesc || (embedFields && embedFields.length > 0)) && (
            <div style={{
              display: 'flex',
              marginTop: '8px',
              maxWidth: '520px',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#2b2d31',
              borderLeft: `4px solid ${embedColor || '#2563eb'}`
            }}>
              {/* Embed Content Wrapper */}
              <div style={{ display: 'flex', padding: '12px 16px', flexGrow: 1, gap: '16px', justifyContent: 'space-between', minWidth: 0 }}>
                {/* Embed Main Text */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  
                  {/* Embed Author */}
                  {((embedAuthorEnabled && embedAuthorName) || (!embedAuthorEnabled && guildName)) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {(embedAuthorEnabled ? embedAuthorIcon : guildIcon) ? (
                        <img 
                          src={embedAuthorEnabled ? embedAuthorIcon : guildIcon} 
                          alt="" 
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : null}
                      {embedAuthorEnabled && embedAuthorUrl ? (
                        <a 
                          href={embedAuthorUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', textDecoration: 'none' }}
                          onClick={(e) => e.preventDefault()}
                        >
                          {resolvePlaceholders(embedAuthorName)}
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>
                          {embedAuthorEnabled ? resolvePlaceholders(embedAuthorName) : guildName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Embed Title */}
                  {embedTitle && (
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '1rem', marginBottom: '8px', wordBreak: 'break-word' }}>
                      {resolvePlaceholders(embedTitle)}
                    </div>
                  )}

                  {/* Embed Description */}
                  {embedDesc && (
                    <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {resolvePlaceholders(embedDesc)}
                    </div>
                  )}

                  {/* Embed Fields */}
                  {embedFields && embedFields.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px 16px', 
                      marginTop: '12px',
                      marginBottom: '4px' 
                    }}>
                      {embedFields.map((field, idx) => {
                        if (!field.name || !field.value) return null;
                        const width = field.inline ? 'calc(33.3% - 11px)' : '100%';
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              flex: `1 0 ${field.inline ? '120px' : '100%'}`, 
                              maxWidth: width,
                              wordBreak: 'break-word' 
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                              {resolvePlaceholders(field.name)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap' }}>
                              {resolvePlaceholders(field.value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Large Image */}
                  {embedImage && (
                    <div style={{ marginTop: '12px', borderRadius: '4px', overflow: 'hidden', maxWidth: '100%', maxHeight: '300px' }}>
                      <img src={embedImage} alt="" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }} />
                    </div>
                  )}

                  {/* Embed Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#949ba4', fontSize: '0.75rem' }}>
                    {(embedFooterEnabled ? embedFooterIcon : guildIcon) ? (
                      <img 
                        src={embedFooterEnabled ? embedFooterIcon : guildIcon} 
                        alt="" 
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : null}
                    <span>{embedFooterEnabled ? resolvePlaceholders(embedFooterText) : `${guildName} Official Announcement`}</span>
                    <span>•</span>
                    <span>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                </div>

                {/* Thumbnail (if set) */}
                {embedThumb && (
                  <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={embedThumb} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {((buttons && buttons.length > 0) || (buttonEnabled && buttonLabel)) && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {buttons && buttons.length > 0 ? (
                buttons.map((btn, idx) => (
                  <span 
                    key={idx}
                    style={{
                      backgroundColor: '#4e5058',
                      color: '#ffffff',
                      padding: '6px 16px',
                      borderRadius: '3px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span>{btn.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </span>
                ))
              ) : (
                <span 
                  style={{
                    backgroundColor: '#4e5058',
                    color: '#ffffff',
                    padding: '6px 16px',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{buttonLabel}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ guildId, guildName, guildIcon, onBack, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [logs, setLogs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Custom Mass-DM Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastButtonEnabled, setBroadcastButtonEnabled] = useState(false);
  const [broadcastButtonLabel, setBroadcastButtonLabel] = useState('');
  const [broadcastButtonUrl, setBroadcastButtonUrl] = useState('');
  const [broadcastButtons, setBroadcastButtons] = useState([]); // Multiple buttons support
  const [broadcastEmbedEnabled, setBroadcastEmbedEnabled] = useState(false);
  const [broadcastEmbedTitle, setBroadcastEmbedTitle] = useState('');
  const [broadcastEmbedDesc, setBroadcastEmbedDesc] = useState('');
  const [broadcastEmbedColor, setBroadcastEmbedColor] = useState('#2563eb');
  const [broadcastEmbedThumb, setBroadcastEmbedThumb] = useState('');
  const [broadcastEmbedImage, setBroadcastEmbedImage] = useState('');
  
  // Expanded Mass DM embed customization
  const [broadcastEmbedAuthorEnabled, setBroadcastEmbedAuthorEnabled] = useState(false);
  const [broadcastEmbedAuthorName, setBroadcastEmbedAuthorName] = useState('');
  const [broadcastEmbedAuthorIcon, setBroadcastEmbedAuthorIcon] = useState('');
  const [broadcastEmbedAuthorUrl, setBroadcastEmbedAuthorUrl] = useState('');
  const [broadcastEmbedFooterEnabled, setBroadcastEmbedFooterEnabled] = useState(false);
  const [broadcastEmbedFooterText, setBroadcastEmbedFooterText] = useState('');
  const [broadcastEmbedFooterIcon, setBroadcastEmbedFooterIcon] = useState('');
  const [broadcastEmbedFields, setBroadcastEmbedFields] = useState([]);
  
  // Mass DM filters
  const [broadcastExcludeRole, setBroadcastExcludeRole] = useState('');
  const [broadcastDelayInterval, setBroadcastDelayInterval] = useState(1);
  const [broadcastIsScheduled, setBroadcastIsScheduled] = useState(false);
  const [broadcastScheduledTime, setBroadcastScheduledTime] = useState('');
  const [scheduledDMs, setScheduledDMs] = useState([]);
  const [broadcastsList, setBroadcastsList] = useState([]);
  
  // Active broadcast progress tracking
  const [activeBroadcastProgress, setActiveBroadcastProgress] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);

  // Channel Publisher State
  const [pubChannelId, setPubChannelId] = useState('');
  const [pubMessage, setPubMessage] = useState('');
  const [pubButtonEnabled, setPubButtonEnabled] = useState(false);
  const [pubButtonLabel, setPubButtonLabel] = useState('');
  const [pubButtonUrl, setPubButtonUrl] = useState('');
  
  // Expanded announcement features state hooks
  const [pubPingType, setPubPingType] = useState('none'); // 'none' | 'everyone' | 'here' | 'role'
  const [pubPingRoleId, setPubPingRoleId] = useState('');
  const [pubButtons, setPubButtons] = useState([]); // Array of { label, url }
  const [pubEmbedAuthorEnabled, setPubEmbedAuthorEnabled] = useState(false);
  const [pubEmbedAuthorName, setPubEmbedAuthorName] = useState('');
  const [pubEmbedAuthorIcon, setPubEmbedAuthorIcon] = useState('');
  const [pubEmbedAuthorUrl, setPubEmbedAuthorUrl] = useState('');
  const [pubEmbedFooterEnabled, setPubEmbedFooterEnabled] = useState(false);
  const [pubEmbedFooterText, setPubEmbedFooterText] = useState('');
  const [pubEmbedFooterIcon, setPubEmbedFooterIcon] = useState('');
  const [pubEmbedFields, setPubEmbedFields] = useState([]); // Array of { name, value, inline }

  const [pubEmbedEnabled, setPubEmbedEnabled] = useState(false);
  const [pubEmbedTitle, setPubEmbedTitle] = useState('');
  const [pubEmbedDesc, setPubEmbedDesc] = useState('');
  const [pubEmbedColor, setPubEmbedColor] = useState('#2563eb');
  const [pubEmbedThumb, setPubEmbedThumb] = useState('');
  const [pubEmbedImage, setPubEmbedImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [resolvingChannel, setResolvingChannel] = useState(false);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState('');

  const handleResolveYoutubeChannel = async () => {
    const channelUrlInput = settings?.youtube?.channelUrl;
    if (!channelUrlInput) {
      setErrorMsg('Please enter a YouTube channel URL or handle.');
      return;
    }
    
    setResolvingChannel(true);
    setResolveSuccessMsg('');
    setErrorMsg(null);
    try {
      const res = await api.resolveYoutubeChannel(guildId, channelUrlInput);
      handleInputChange('youtube.channelId', res.channelId);
      handleInputChange('youtube.channelName', res.channelName);
      handleInputChange('youtube.channelUrl', res.channelUrl);
      setResolveSuccessMsg(`Successfully connected to channel: ${res.channelName}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to resolve YouTube channel.');
    } finally {
      setResolvingChannel(false);
    }
  };

  // Scheduling & Template states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledAnnouncements, setScheduledAnnouncements] = useState([]);
  
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTypeForModal, setTemplateTypeForModal] = useState('announcement');

  // Premium Polls State Hooks
  const [polls, setPolls] = useState([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollChannelId, setPollChannelId] = useState('');
  const [pollMultipleChoice, setPollMultipleChoice] = useState(false);
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [pollShowResultsBeforeEnding, setPollShowResultsBeforeEnding] = useState(true);
  const [pollExpiresAt, setPollExpiresAt] = useState('');
  const [pollColor, setPollColor] = useState('#2563eb');
  const [pollImageUrl, setPollImageUrl] = useState('');
  const [pollThumbnailUrl, setPollThumbnailUrl] = useState('');
  const [creatingPoll, setCreatingPoll] = useState(false);





  const handleSendBroadcast = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastMessage && (!broadcastEmbedEnabled || (!broadcastEmbedTitle && !broadcastEmbedDesc && broadcastEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message or set up a valid embed title/description.');
      return;
    }

    if (broadcastIsScheduled && !broadcastScheduledTime) {
      setErrorMsg('Please select a release date & time for your scheduled broadcast.');
      return;
    }
    
    // Validation for link buttons
    let targetButtons = [...broadcastButtons];
    if (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl) {
      targetButtons.push({ label: broadcastButtonLabel, url: broadcastButtonUrl });
    }
    const invalidButton = targetButtons.find(btn => !btn.label || !btn.url);
    if (invalidButton) {
      setErrorMsg('All enabled buttons must have a valid label and URL.');
      return;
    }

    if (!window.confirm(broadcastIsScheduled 
      ? `Are you sure you want to schedule this DM broadcast to members of ${guildName}?` 
      : `Are you sure you want to broadcast this DM to members of ${guildName}? This action cannot be undone.`
    )) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      message: broadcastMessage,
      buttons: targetButtons,
      filterRole: '',
      excludeRole: broadcastExcludeRole,
      delayInterval: Number(broadcastDelayInterval) || 1,
      embed: {
        enabled: broadcastEmbedEnabled,
        title: broadcastEmbedTitle,
        description: broadcastEmbedDesc,
        color: broadcastEmbedColor,
        thumbnail: broadcastEmbedThumb,
        image: broadcastEmbedImage,
        author: {
          enabled: broadcastEmbedAuthorEnabled,
          name: broadcastEmbedAuthorName,
          iconURL: broadcastEmbedAuthorIcon,
          url: broadcastEmbedAuthorUrl
        },
        footer: {
          enabled: broadcastEmbedFooterEnabled,
          text: broadcastEmbedFooterText,
          iconURL: broadcastEmbedFooterIcon
        },
        fields: broadcastEmbedFields
      }
    };

    try {
      if (broadcastIsScheduled) {
        payload.publishAt = broadcastScheduledTime;
        const res = await api.scheduleDM(guildId, payload);
        showNotification(res.message || 'Mass DM broadcast successfully scheduled!');
        fetchScheduledDMs();
      } else {
        setBroadcasting(true);
        setActiveBroadcastProgress({
          status: 'sending',
          totalTargets: 0,
          successCount: 0,
          failCount: 0
        });
        const res = await api.sendMassDM(guildId, payload);
        showNotification(res.message || 'Mass DM broadcast successfully started!');
        fetchBroadcastsHistory();
      }
      
      // Reset form
      setBroadcastMessage('');
      setBroadcastButtonEnabled(false);
      setBroadcastButtonLabel('');
      setBroadcastButtonUrl('');
      setBroadcastButtons([]);
      setBroadcastEmbedEnabled(false);
      setBroadcastEmbedTitle('');
      setBroadcastEmbedDesc('');
      setBroadcastEmbedThumb('');
      setBroadcastEmbedImage('');
      setBroadcastEmbedAuthorEnabled(false);
      setBroadcastEmbedAuthorName('');
      setBroadcastEmbedAuthorIcon('');
      setBroadcastEmbedAuthorUrl('');
      setBroadcastEmbedFooterEnabled(false);
      setBroadcastEmbedFooterText('');
      setBroadcastEmbedFooterIcon('');
      setBroadcastEmbedFields([]);
      setBroadcastExcludeRole('');
      setBroadcastDelayInterval(1);
      setBroadcastIsScheduled(false);
      setBroadcastScheduledTime('');

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to trigger broadcast DMs.');
      if (!broadcastIsScheduled) {
        setActiveBroadcastProgress(null);
      }
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSendTestDM = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastMessage && (!broadcastEmbedEnabled || (!broadcastEmbedTitle && !broadcastEmbedDesc && broadcastEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message or set up a valid embed title/description before testing.');
      return;
    }

    let targetButtons = [...broadcastButtons];
    if (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl) {
      targetButtons.push({ label: broadcastButtonLabel, url: broadcastButtonUrl });
    }

    try {
      showNotification('Sending test DM to your Discord account...');
      const res = await api.sendTestDM(guildId, {
        message: broadcastMessage,
        buttons: targetButtons,
        embed: {
          enabled: broadcastEmbedEnabled,
          title: broadcastEmbedTitle,
          description: broadcastEmbedDesc,
          color: broadcastEmbedColor,
          thumbnail: broadcastEmbedThumb,
          image: broadcastEmbedImage,
          author: {
            enabled: broadcastEmbedAuthorEnabled,
            name: broadcastEmbedAuthorName,
            iconURL: broadcastEmbedAuthorIcon,
            url: broadcastEmbedAuthorUrl
          },
          footer: {
            enabled: broadcastEmbedFooterEnabled,
            text: broadcastEmbedFooterText,
            iconURL: broadcastEmbedFooterIcon
          },
          fields: broadcastEmbedFields
        }
      });
      showNotification(res.message || 'Test DM sent successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send test DM.');
    }
  };

  const handleSendChannelMessage = async (e) => {
    if (e) e.preventDefault();
    if (!pubChannelId) {
      setErrorMsg('Please select a target channel.');
      return;
    }

    if (!pubMessage && (!pubEmbedEnabled || (!pubEmbedTitle && !pubEmbedDesc && pubEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message, embed content, or add fields to send.');
      return;
    }

    if (isScheduled && !scheduledTime) {
      setErrorMsg('Please select a release date & time for your scheduled announcement.');
      return;
    }

    // Validation for link buttons
    let targetButtons = [...pubButtons];
    if (pubButtonEnabled && pubButtonLabel && pubButtonUrl) {
      targetButtons.push({ label: pubButtonLabel, url: pubButtonUrl });
    }
    const invalidButton = targetButtons.find(btn => !btn.label || !btn.url);
    if (invalidButton) {
      setErrorMsg('All enabled buttons must have a valid label and URL.');
      return;
    }

    const channelName = channels.find(c => c.id === pubChannelId)?.name || 'selected channel';
    
    if (isScheduled) {
      if (!window.confirm(`Are you sure you want to schedule this announcement to #${channelName} at ${new Date(scheduledTime).toLocaleString()}?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to send this styled message to #${channelName}?`)) {
        return;
      }
    }

    setPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        channelId: pubChannelId,
        message: pubMessage,
        ping: {
          type: pubPingType,
          roleId: pubPingRoleId
        },
        buttons: targetButtons,
        embed: {
          enabled: pubEmbedEnabled,
          title: pubEmbedTitle,
          description: pubEmbedDesc,
          color: pubEmbedColor,
          thumbnail: pubEmbedThumb,
          image: pubEmbedImage,
          author: {
            enabled: pubEmbedAuthorEnabled,
            name: pubEmbedAuthorName,
            iconURL: pubEmbedAuthorIcon,
            url: pubEmbedAuthorUrl
          },
          footer: {
            enabled: pubEmbedFooterEnabled,
            text: pubEmbedFooterText,
            iconURL: pubEmbedFooterIcon
          },
          fields: pubEmbedFields
        }
      };

      if (isScheduled) {
        payload.publishAt = scheduledTime;
        const res = await api.scheduleAnnouncement(guildId, payload);
        showNotification(res.message || 'Announcement scheduled successfully!');
        fetchScheduledAnnouncements();
      } else {
        const res = await api.sendChannelMessage(guildId, payload);
        showNotification(res.message || 'Announcement published successfully!');
      }

      // Reset form
      setPubMessage('');
      setPubPingType('none');
      setPubPingRoleId('');
      setPubButtons([]);
      setPubButtonEnabled(false);
      setPubButtonLabel('');
      setPubButtonUrl('');
      setPubEmbedEnabled(false);
      setPubEmbedTitle('');
      setPubEmbedDesc('');
      setPubEmbedThumb('');
      setPubEmbedImage('');
      setPubEmbedAuthorEnabled(false);
      setPubEmbedAuthorName('');
      setPubEmbedAuthorIcon('');
      setPubEmbedAuthorUrl('');
      setPubEmbedFooterEnabled(false);
      setPubEmbedFooterText('');
      setPubEmbedFooterIcon('');
      setPubEmbedFields([]);
      setIsScheduled(false);
      setScheduledTime('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process request.');
    } finally {
      setPublishing(false);
    }
  };

  // Templates Management Helpers
  const fetchTemplates = async (type) => {
    try {
      const data = await api.getTemplates(guildId, type);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err.message);
    }
  };

  const handleSaveTemplate = async (name, type) => {
    if (!name.trim()) return;
    try {
      let data = {};
      if (type === 'announcement') {
        data = {
          message: pubMessage,
          pubPingType,
          pubPingRoleId,
          pubButtons,
          pubButtonEnabled,
          pubButtonLabel,
          pubButtonUrl,
          pubEmbedEnabled,
          pubEmbedTitle,
          pubEmbedDesc,
          pubEmbedColor,
          pubEmbedThumb,
          pubEmbedImage,
          pubEmbedAuthorEnabled,
          pubEmbedAuthorName,
          pubEmbedAuthorIcon,
          pubEmbedAuthorUrl,
          pubEmbedFooterEnabled,
          pubEmbedFooterText,
          pubEmbedFooterIcon,
          pubEmbedFields
        };
      } else {
        data = {
          message: broadcastMessage,
          broadcastExcludeRole,
          broadcastButtons,
          broadcastButtonEnabled,
          broadcastButtonLabel,
          broadcastButtonUrl,
          broadcastEmbedEnabled,
          broadcastEmbedTitle,
          broadcastEmbedDesc,
          broadcastEmbedColor,
          broadcastEmbedThumb,
          broadcastEmbedImage,
          broadcastEmbedAuthorEnabled,
          broadcastEmbedAuthorName,
          broadcastEmbedAuthorIcon,
          broadcastEmbedAuthorUrl,
          broadcastEmbedFooterEnabled,
          broadcastEmbedFooterText,
          broadcastEmbedFooterIcon,
          broadcastEmbedFields,
          broadcastDelayInterval
        };
      }

      await api.saveTemplate(guildId, { name, type, data });
      showNotification('Template saved successfully!');
      fetchTemplates(type);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save template.');
    }
  };

  const handleLoadTemplate = (tpl) => {
    const { data } = tpl;
    if (tpl.type === 'announcement') {
      setPubMessage(data.message || '');
      setPubPingType(data.pubPingType || 'none');
      setPubPingRoleId(data.pubPingRoleId || '');
      setPubButtons(data.pubButtons || []);
      setPubButtonEnabled(!!data.pubButtonEnabled);
      setPubButtonLabel(data.pubButtonLabel || '');
      setPubButtonUrl(data.pubButtonUrl || '');
      setPubEmbedEnabled(!!data.pubEmbedEnabled);
      setPubEmbedTitle(data.pubEmbedTitle || '');
      setPubEmbedDesc(data.pubEmbedDesc || '');
      setPubEmbedColor(data.pubEmbedColor || '#2563eb');
      setPubEmbedThumb(data.pubEmbedThumb || '');
      setPubEmbedImage(data.pubEmbedImage || '');
      setPubEmbedAuthorEnabled(!!data.pubEmbedAuthorEnabled);
      setPubEmbedAuthorName(data.pubEmbedAuthorName || '');
      setPubEmbedAuthorIcon(data.pubEmbedAuthorIcon || '');
      setPubEmbedAuthorUrl(data.pubEmbedAuthorUrl || '');
      setPubEmbedFooterEnabled(!!data.pubEmbedFooterEnabled);
      setPubEmbedFooterText(data.pubEmbedFooterText || '');
      setPubEmbedFooterIcon(data.pubEmbedFooterIcon || '');
      setPubEmbedFields(data.pubEmbedFields || []);
    } else {
      setBroadcastMessage(data.message || '');
      setBroadcastExcludeRole(data.broadcastExcludeRole || '');
      setBroadcastButtons(data.broadcastButtons || []);
      setBroadcastButtonEnabled(!!data.broadcastButtonEnabled);
      setBroadcastButtonLabel(data.broadcastButtonLabel || '');
      setBroadcastButtonUrl(data.broadcastButtonUrl || '');
      setBroadcastEmbedEnabled(!!data.broadcastEmbedEnabled);
      setBroadcastEmbedTitle(data.broadcastEmbedTitle || '');
      setBroadcastEmbedDesc(data.broadcastEmbedDesc || '');
      setBroadcastEmbedColor(data.broadcastEmbedColor || '#2563eb');
      setBroadcastEmbedThumb(data.broadcastEmbedThumb || '');
      setBroadcastEmbedImage(data.broadcastEmbedImage || '');
      setBroadcastEmbedAuthorEnabled(!!data.broadcastEmbedAuthorEnabled);
      setBroadcastEmbedAuthorName(data.broadcastEmbedAuthorName || '');
      setBroadcastEmbedAuthorIcon(data.broadcastEmbedAuthorIcon || '');
      setBroadcastEmbedAuthorUrl(data.broadcastEmbedAuthorUrl || '');
      setBroadcastEmbedFooterEnabled(!!data.broadcastEmbedFooterEnabled);
      setBroadcastEmbedFooterText(data.broadcastEmbedFooterText || '');
      setBroadcastEmbedFooterIcon(data.broadcastEmbedFooterIcon || '');
      setBroadcastEmbedFields(data.broadcastEmbedFields || []);
      setBroadcastDelayInterval(data.broadcastDelayInterval || 1);
    }
    showNotification(`Template "${tpl.name}" loaded successfully.`);
  };

  const handleDeleteTemplate = async (templateId, type) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteTemplate(guildId, templateId);
      showNotification('Template deleted successfully.');
      fetchTemplates(type);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete template.');
    }
  };

  // Scheduled Announcements helpers
  const fetchScheduledAnnouncements = async () => {
    try {
      const data = await api.getScheduledAnnouncements(guildId);
      setScheduledAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch scheduled announcements:', err.message);
    }
  };

  const handleDeleteScheduledAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled announcement?')) return;
    try {
      await api.deleteScheduledAnnouncement(guildId, announcementId);
      showNotification('Scheduled announcement cancelled.');
      fetchScheduledAnnouncements();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel scheduled announcement.');
    }
  };

  // Scheduled DMs & Broadcast History helpers
  const fetchScheduledDMs = async () => {
    try {
      const data = await api.getScheduledDMs(guildId);
      setScheduledDMs(data);
    } catch (err) {
      console.error('Failed to fetch scheduled DMs:', err.message);
    }
  };

  const fetchBroadcastsHistory = async () => {
    try {
      const data = await api.getBroadcasts(guildId);
      setBroadcastsList(data);
    } catch (err) {
      console.error('Failed to fetch broadcasts history:', err.message);
    }
  };

  const handleDeleteScheduledDM = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled DM broadcast?')) return;
    try {
      await api.deleteScheduledDM(guildId, id);
      showNotification('Scheduled DM broadcast cancelled.');
      fetchScheduledDMs();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel scheduled DM broadcast.');
    }
  };

  const handleRevokeBroadcast = async (broadcastId) => {
    if (!window.confirm('WARNING: This will attempt to delete this message for all users who received it. Are you sure you want to proceed?')) return;
    try {
      await api.revokeBroadcast(guildId, broadcastId);
      showNotification('DM Revocation process started in the background.');
      fetchBroadcastsHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start DM revocation.');
    }
  };

  // Active Broadcast Cancellation
  const handleCancelActiveBroadcast = async (broadcastId) => {
    if (!window.confirm('Are you sure you want to stop this running broadcast immediately?')) return;
    try {
      const res = await api.cancelBroadcast(guildId, broadcastId);
      showNotification(res.message || 'Broadcast cancel request sent.');
      fetchBroadcastsHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel running broadcast.');
    }
  };

  // Premium Poll Helpers
  const fetchPolls = async () => {
    try {
      const data = await api.getPolls(guildId);
      setPolls(data);
    } catch (err) {
      console.error('Failed to fetch polls:', err.message);
    }
  };

  const handleCreatePoll = async (e) => {
    if (e) e.preventDefault();
    if (!pollChannelId) {
      setErrorMsg('Please select a target channel.');
      return;
    }
    if (!pollQuestion.trim()) {
      setErrorMsg('Please enter a question.');
      return;
    }
    const filteredOptions = pollOptions.map(opt => opt.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      setErrorMsg('Please enter at least two options.');
      return;
    }

    setCreatingPoll(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      channelId: pollChannelId,
      question: pollQuestion,
      description: pollDescription,
      options: filteredOptions,
      settings: {
        multipleChoice: pollMultipleChoice,
        anonymous: pollAnonymous,
        showResultsBeforeEnding: pollShowResultsBeforeEnding,
        expiresAt: pollExpiresAt || undefined,
        color: pollColor,
        imageUrl: pollImageUrl || undefined,
        thumbnailUrl: pollThumbnailUrl || undefined
      }
    };

    try {
      await api.createPoll(guildId, payload);
      showNotification('Poll created and published to Discord successfully!');
      
      // Reset form
      setPollQuestion('');
      setPollDescription('');
      setPollOptions(['', '']);
      setPollMultipleChoice(false);
      setPollAnonymous(false);
      setPollShowResultsBeforeEnding(true);
      setPollExpiresAt('');
      setPollColor('#2563eb');
      setPollImageUrl('');
      setPollThumbnailUrl('');
      
      fetchPolls();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create poll.');
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleEndPoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to end this poll immediately? Voters will not be able to vote anymore.')) return;
    try {
      await api.endPoll(guildId, pollId);
      showNotification('Poll ended successfully.');
      fetchPolls();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to end poll.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? The Discord message will be deleted, and all vote data will be removed.')) return;
    try {
      await api.deletePoll(guildId, pollId);
      showNotification('Poll deleted successfully.');
      fetchPolls();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete poll.');
    }
  };


  // Load Channels, Roles, and Settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [chData, rData, sData, catData, vcData] = await Promise.all([
          api.getChannels(guildId),
          api.getRoles(guildId),
          api.getSettings(guildId),
          api.getCategories(guildId),
          api.getVoiceChannels(guildId)
        ]);
        setChannels(chData);
        setRoles(rData);
        setSettings(sData);
        setCategories(catData || []);
        setVoiceChannels(vcData || []);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load server data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [guildId]);

  // Initialize Socket.IO connection and join room
  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:10000'
      : window.location.origin;


    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });


    newSocket.emit('join_guild', guildId);

    newSocket.on('new_log', (log) => {
      setLogs(prev => [log, ...prev]);
    });

    newSocket.on('broadcast_progress', (progress) => {
      console.log('[Socket] Received broadcast progress:', progress);
      setActiveBroadcastProgress(progress);
      if (progress.status === 'completed' || progress.status === 'cancelled' || progress.status === 'failed') {
        fetchBroadcastsHistory();
        setTimeout(() => setActiveBroadcastProgress(null), 10000); // hide status after 10 seconds of completion
      }
    });

    newSocket.on('poll_update', (updatedPoll) => {
      setPolls(prev => {
        const index = prev.findIndex(p => p._id === updatedPoll._id);
        if (index > -1) {
          const newPolls = [...prev];
          newPolls[index] = updatedPoll;
          return newPolls;
        } else {
          return [updatedPoll, ...prev];
        }
      });
    });

    newSocket.on('poll_delete', ({ pollId }) => {
      setPolls(prev => prev.filter(p => p._id !== pollId));
    });

    return () => {
      newSocket.emit('leave_guild', guildId);
      newSocket.disconnect();
    };

  }, [guildId]);

  // Load templates, scheduled posts & polls on tab changes
  useEffect(() => {
    if (activeTab === 'publish') {
      fetchTemplates('announcement');
      fetchScheduledAnnouncements();
    } else if (activeTab === 'broadcast') {
      fetchTemplates('dm');
      fetchScheduledDMs();
      fetchBroadcastsHistory();
      setActiveBroadcastProgress(null); // Reset preview
    } else if (activeTab === 'polls') {
      fetchPolls();
    }
  }, [activeTab, guildId]);


  // Load moderation logs when active tab is logs
  useEffect(() => {
    if (activeTab === 'logs') {
      const fetchLogs = async () => {
        try {
          const res = await api.getLogs(guildId);
          setLogs(res);
        } catch (err) {
          console.error('[Dashboard] Failed to fetch moderation logs:', err.message);
        }
      };
      fetchLogs();
    }
  }, [activeTab, guildId]);

  const handleDragStart = (e, elementKey) => {
    e.preventDefault();
    const parent = e.currentTarget.parentElement;
    const rect = parent.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      let newX = ((clientX - rect.left) / rect.width) * 800;
      let newY = ((clientY - rect.top) / rect.height) * 450;

      newX = Math.round(Math.max(0, Math.min(800, newX)));
      newY = Math.round(Math.max(0, Math.min(450, newY)));

      handleInputChange(`welcome.${elementKey}X`, newX);
      handleInputChange(`welcome.${elementKey}Y`, newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: true });
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleToggle = (path) => {
    const parts = path.split('.');
    setSettings(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined || current[parts[i]] === null) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = !current[parts[parts.length - 1]];
      return updated;
    });
  };

  const handleInputChange = (path, value) => {
    const parts = path.split('.');
    setSettings(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined || current[parts[i]] === null) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const resolveUploadUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const isLocal = window.location.port === '5173' || window.location.port === '5174';
      return isLocal ? `http://localhost:10000${url}` : url;
    }
    return url;
  };


  const handleResetLayout = () => {
    setSettings(prev => ({
      ...prev,
      welcome: {
        ...prev.welcome,
        avatarSize: 140,
        avatarX: 400,
        avatarY: 130,
        avatarRotation: 0,
        avatarBorderThickness: 6,
        avatarBorderColor: '#ffffff',
        usernameX: 400,
        usernameY: 320,
        usernameSize: 38,
        titleX: 400,
        titleY: 260,
        titleSize: 54,
        subtextX: 400,
        subtextY: 370,
        subtextSize: 22,
        textAlignment: 'center',
        fontWeight: 'bold',
        avatarEnabled: true,
        titleEnabled: true,
        usernameEnabled: true,
        subtextEnabled: true,
        layoutType: 'classic',
        titleText: 'WELCOME',
        subtextText: 'TO {server}',
        usernameColor: '#2563eb',
        subtextColor: 'rgba(255, 255, 255, 0.7)',
        textShadowEnabled: false,
        textShadowColor: '#000000',
        textShadowBlur: 5,
        avatarShadowEnabled: false,
        avatarShadowColor: '#2563eb',
        avatarShadowBlur: 15,
        overlayOpacity: 0.3,
        overlayColor: '#000000',
        cardBorderEnabled: false,
        cardBorderColor: '#2563eb',
        cardBorderThickness: 8
      }
    }));
    showNotification('Layout reset to default positions, sizes & visibility!');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const updated = await api.saveSettings(guildId, settings);
      setSettings(updated);
      showNotification('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save settings. Please verify details.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishVerification = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // First save settings
      await api.saveSettings(guildId, settings);
      // Publish
      const res = await api.publishVerification(guildId);
      showNotification(res.message || 'Verification message published!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to publish verification message.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTickets = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // First save settings
      await api.saveSettings(guildId, settings);
      // Publish
      const res = await api.publishTickets(guildId);
      showNotification(res.message || 'Ticket system message published!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to publish ticket system message.');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Syncing settings database...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', borderColor: 'var(--danger)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Failed to Load Settings</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Could not retrieve settings for this server. Please check if the bot is online and running.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={onBack} className="btn-secondary">Back to Servers</button>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container dashboard-container">
        
        {/* Top Navigation Header Bar */}
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <button 
            onClick={onBack} 
            className="btn-secondary" 
            style={{ 
              padding: '9px 18px', 
              fontSize: '0.825rem',
              borderRadius: '10px'
            }}
          >
            <ChevronLeft size={16} />
            Back to Servers
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {guildIcon ? (
              <img 
                src={guildIcon} 
                alt={guildName} 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }} 
              />
            ) : (
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.9rem', 
                fontWeight: 'bold',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
              }}>
                {guildName[0].toUpperCase()}
              </div>
            )}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>{guildName}</h3>
          </div>
        </header>

        {/* Global Notifications */}
        {successMsg && (
          <div className="glass-panel pulse-glow" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            borderColor: 'var(--success)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            fontFamily: 'Outfit',
            fontWeight: '600'
          }}>
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="glass-panel" style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
            padding: '14px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            {errorMsg}
          </div>
        )}

        {/* Navigation Menu Tab Bar - Wrapping to ensure all features are fully visible */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '32px'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
            { id: 'moderation', label: 'Moderation', icon: <Shield size={14} /> },
            { id: 'welcome', label: 'Welcome System', icon: <Sparkles size={14} /> },
            { id: 'verification', label: 'Verification Role', icon: <UserCheck size={14} /> },
            { id: 'tickets', label: 'Ticket System', icon: <Ticket size={14} /> },
            { id: 'roles', label: 'Roles & Nicknames', icon: <MessageSquare size={14} /> },
            { id: 'logs', label: 'Server Logs', icon: <FileText size={14} /> },
            { id: 'broadcast', label: 'Broadcast DMs', icon: <Send size={14} /> },
            { id: 'publish', label: 'Publish Announcement', icon: <Megaphone size={14} /> },
            { id: 'polls', label: 'Premium Polls', icon: <BarChart2 size={14} /> },
            { id: 'youtube', label: 'YouTube Announcements', icon: <Youtube size={14} /> },
            { id: 'tempvoice', label: 'Temp Voice Channels', icon: <Sparkles size={14} /> }
          ].map(tab => (

            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                gap: '6px',
                borderWidth: '1px',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          {user && user.isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('server-control')}
              className={activeTab === 'server-control' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                gap: '6px',
                borderWidth: '1px',
                background: activeTab === 'server-control' ? 'var(--primary)' : 'transparent',
                borderColor: activeTab === 'server-control' ? 'var(--primary)' : 'var(--border-color)',
                color: activeTab === 'server-control' ? '#fff' : 'var(--primary)'
              }}
            >
              <Server size={14} />
              Server Control
            </button>
          )}
        </div>

        {/* Main Settings Panel */}
        <main className="glass-panel" style={{ padding: '36px', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', width: '100%', maxWidth: '100%', minWidth: 0 }}>
          {activeTab === 'server-control' && user && user.isAdmin ? (
            <AdminServerSettings guildId={guildId} />
          ) : (
            <form onSubmit={handleSave}>
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Server Overview</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>General status and command manual for the TIMOXITER bot.</p>
                </div>

                {/* Flat Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px 20px', textAlign: 'center', background: '#000000', border: '1px solid #27272a', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Bot Status</span>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '8px', color: 'var(--success)', fontWeight: '800' }}>ONLINE</h3>
                  </div>
                  <div style={{ padding: '24px 20px', textAlign: 'center', background: '#000000', border: '1px solid #27272a', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Text Channels</span>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '8px', color: '#ffffff', fontWeight: '800' }}>{channels.length}</h3>
                  </div>
                  <div style={{ padding: '24px 20px', textAlign: 'center', background: '#000000', border: '1px solid #27272a', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Custom Roles</span>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '8px', color: '#ffffff', fontWeight: '800' }}>{roles.length}</h3>
                  </div>
                </div>

                {/* Centered Subtitle */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>Slash Command Reference</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Integrated command triggers available directly inside your Discord server.</p>
                </div>

                {/* Grid of Command Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '20px', background: '#000000', border: '1px solid #27272a', borderRadius: '6px', textAlign: 'left' }}>
                    <div style={{ display: 'inline-block', color: 'var(--secondary)', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' }}>
                      /userinfo
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>User Details</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Fetches joining timeline, account registration date, and role list for a target member.</p>
                  </div>

                  <div style={{ padding: '20px', background: '#000000', border: '1px solid #27272a', borderRadius: '6px', textAlign: 'left' }}>
                    <div style={{ display: 'inline-block', color: 'var(--secondary)', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' }}>
                      /serverinfo
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Server Details</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Visualizes total member count, role count, active owner ID, and guild creation date.</p>
                  </div>

                  <div style={{ padding: '20px', background: '#000000', border: '1px solid #27272a', borderRadius: '6px', textAlign: 'left' }}>
                    <div style={{ display: 'inline-block', color: 'var(--secondary)', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' }}>
                      /dashboard
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Dashboard Link</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Replies with an interactive link directing server admins directly to this configuration portal.</p>
                  </div>

                  <div style={{ padding: '20px', background: '#000000', border: '1px solid #27272a', borderRadius: '6px', textAlign: 'left' }}>
                    <div style={{ display: 'inline-block', color: 'var(--secondary)', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '10px' }}>
                      /clear
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Clear Messages</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Automatically purges messages sent by the bot from the current text channel.</p>
                  </div>
                </div>
              </div>
            )}

              {/* TAB 2: MODERATION */}
              {activeTab === 'moderation' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Moderation Features</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Set channel-specific protective filters against fast spamming and unauthorized URLs.</p>

                  {/* Section 1: Spam Protection */}
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Spam Message Blocker</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deletes spam messages and automatically applies timeouts to spamming users.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.moderation.spam.enabled} 
                          onChange={() => handleToggle('moderation.spam.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.moderation.spam.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Spam Threshold (messages)</label>
                            <input 
                              type="number" 
                              min="2" 
                              max="30"
                              value={settings.moderation.spam.maxMessages}
                              onChange={(e) => handleInputChange('moderation.spam.maxMessages', parseInt(e.target.value))}
                              className="glass-input" 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Interval Window (seconds)</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="60"
                              value={settings.moderation.spam.timeWindow / 1000}
                              onChange={(e) => handleInputChange('moderation.spam.timeWindow', parseInt(e.target.value) * 1000)}
                              className="glass-input" 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Auto Timeout Duration (minutes)</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="1440"
                              value={settings.moderation.spam.timeoutDuration}
                              onChange={(e) => handleInputChange('moderation.spam.timeoutDuration', parseInt(e.target.value))}
                              className="glass-input" 
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Spam Protected Channels</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select channels here where spam protection will be active.</p>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            {channels.map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                  type="checkbox"
                                  checked={(settings.moderation.spam.protectedChannels || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const current = [...(settings.moderation.spam.protectedChannels || [])];
                                    if (e.target.checked) {
                                      current.push(ch.id);
                                    } else {
                                      const index = current.indexOf(ch.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    handleInputChange('moderation.spam.protectedChannels', current);
                                  }}
                                />
                                #{ch.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Link Protection */}
                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Link Protection & Filters</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instantly blocks and deletes links posted in guarded text channels.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.moderation.links.enabled} 
                          onChange={() => handleToggle('moderation.links.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.moderation.links.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Allowed Link Whitelist (one domain per line, e.g. youtube.com)</label>
                          <textarea
                            rows="3"
                            placeholder="youtube.com&#10;discord.gg"
                            value={settings.moderation.links.allowedLinks.join('\n')}
                            onChange={(e) => handleInputChange('moderation.links.allowedLinks', e.target.value.split('\n').filter(Boolean))}
                            className="glass-input"
                            style={{ fontFamily: 'monospace' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Link Protected Channels</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select channels here where link protection will be active.</p>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            {channels.map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                  type="checkbox"
                                  checked={(settings.moderation.links.protectedChannels || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const current = [...(settings.moderation.links.protectedChannels || [])];
                                    if (e.target.checked) {
                                      current.push(ch.id);
                                    } else {
                                      const index = current.indexOf(ch.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    handleInputChange('moderation.links.protectedChannels', current);
                                  }}
                                />
                                #{ch.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WELCOME SYSTEM */}
              {activeTab === 'welcome' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Welcome System</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Greet new members with gorgeous customized banner images or high-end welcome messages.</p>

                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Welcome Messages & Cards</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send an automated canvas image card or message when members join.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.welcome.enabled} 
                          onChange={() => handleToggle('welcome.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.welcome.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        
                        {/* Welcome Message Layout Selection */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Welcome Message Layout Type</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                            {[
                              { id: 'classic', title: 'Classic Card', desc: 'Message text + image card attachment' },
                              { id: 'embed-card', title: 'Embed with Card', desc: 'Rich embed with card image loaded inside' },
                              { id: 'embed-only', title: 'Embed Only', desc: 'Rich embed only (no card image)' },
                              { id: 'text-only', title: 'Text Message Only', desc: 'Plain text message only' }
                            ].map(layoutOption => (
                              <div
                                key={layoutOption.id}
                                onClick={() => handleInputChange('welcome.layoutType', layoutOption.id)}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  border: `2px solid ${settings.welcome.layoutType === layoutOption.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                  backgroundColor: settings.welcome.layoutType === layoutOption.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: settings.welcome.layoutType === layoutOption.id ? '#ffffff' : 'var(--text-secondary)' }}>
                                  {layoutOption.title}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1rem' }}>
                                  {layoutOption.desc}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Channel and Color Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Greeting Channel</label>
                            <select 
                              value={settings.welcome.channelId}
                              onChange={(e) => handleInputChange('welcome.channelId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- Select Channel --</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Font Family</label>
                            <select 
                              value={settings.welcome.fontFamily || 'Sans'}
                              onChange={(e) => handleInputChange('welcome.fontFamily', e.target.value)}
                              className="glass-input"
                            >
                              <option value="Sans">Sans-Serif (Default)</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Bebas Neue">Bebas Neue</option>
                              <option value="Orbitron">Orbitron</option>
                              <option value="Oswald">Oswald</option>
                              <option value="Inter">Inter</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>

                        {/* Welcomes Card Colors Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title Color (Hex)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={settings.welcome.textColor?.startsWith('#') ? settings.welcome.textColor : `#${settings.welcome.textColor || 'ffffff'}`}
                                onChange={(e) => handleInputChange('welcome.textColor', e.target.value)}
                                style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                              />
                              <input 
                                type="text"
                                value={settings.welcome.textColor || '#ffffff'}
                                onChange={(e) => handleInputChange('welcome.textColor', e.target.value)}
                                className="glass-input"
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Username Color (Hex)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={settings.welcome.usernameColor?.startsWith('#') ? settings.welcome.usernameColor : `#${settings.welcome.usernameColor || '2563eb'}`}
                                onChange={(e) => handleInputChange('welcome.usernameColor', e.target.value)}
                                style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                              />
                              <input 
                                type="text"
                                value={settings.welcome.usernameColor || '#2563eb'}
                                onChange={(e) => handleInputChange('welcome.usernameColor', e.target.value)}
                                className="glass-input"
                                placeholder="#2563eb"
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Subtext Color (Hex)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={settings.welcome.subtextColor?.startsWith('#') ? settings.welcome.subtextColor : `#${settings.welcome.subtextColor || 'ffffff'}`}
                                onChange={(e) => handleInputChange('welcome.subtextColor', e.target.value)}
                                style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                              />
                              <input 
                                type="text"
                                value={settings.welcome.subtextColor || 'rgba(255, 255, 255, 0.7)'}
                                onChange={(e) => handleInputChange('welcome.subtextColor', e.target.value)}
                                className="glass-input"
                                placeholder="rgba(255, 255, 255, 0.7)"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Font Weight and Text Alignment */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Font Weight</label>
                            <select 
                              value={settings.welcome.fontWeight || 'bold'}
                              onChange={(e) => handleInputChange('welcome.fontWeight', e.target.value)}
                              className="glass-input"
                            >
                              <option value="normal">Normal</option>
                              <option value="medium">Medium (500)</option>
                              <option value="600">Semi-Bold (600)</option>
                              <option value="bold">Bold (700)</option>
                              <option value="900">Extra-Bold (900)</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Text Alignment</label>
                            <select 
                              value={settings.welcome.textAlignment || 'center'}
                              onChange={(e) => handleInputChange('welcome.textAlignment', e.target.value)}
                              className="glass-input"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>

                        {/* Welcome Message Text */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Welcome Message Template (Supports {`{user}`}, {`{username}`}, {`{server}`})</label>
                          <input 
                            type="text"
                            value={settings.welcome.message}
                            onChange={(e) => handleInputChange('welcome.message', e.target.value)}
                            className="glass-input"
                            placeholder="Welcome {user} to the server!"
                          />
                        </div>

                        {/* Welcome Card Custom Text Templates */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Card Title Text Template</label>
                            <input 
                              type="text"
                              value={settings.welcome.titleText !== undefined ? settings.welcome.titleText : 'WELCOME'}
                              onChange={(e) => handleInputChange('welcome.titleText', e.target.value)}
                              className="glass-input"
                              placeholder="e.g. WELCOME"
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Card Subtext Template (Supports {`{server}`})</label>
                            <input 
                              type="text"
                              value={settings.welcome.subtextText !== undefined ? settings.welcome.subtextText : 'TO {server}'}
                              onChange={(e) => handleInputChange('welcome.subtextText', e.target.value)}
                              className="glass-input"
                              placeholder="e.g. TO {server}"
                            />
                          </div>
                        </div>

                        {/* Background Upload and controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Background Image/GIF URL or Solid Color Hex</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="text"
                                value={settings.welcome.background}
                                onChange={(e) => handleInputChange('welcome.background', e.target.value)}
                                className="glass-input"
                                placeholder="https://example.com/background.png or #0F0C20"
                              />
                              <label className="btn-secondary" style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                                Upload File
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setUploadFile(file);
                                    setShowCropModal(true);
                                    e.target.value = null; // Clear so same file works again
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div style={{ marginTop: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                              <input 
                                type="checkbox"
                                checked={settings.welcome.gifSupport}
                                onChange={() => handleToggle('welcome.gifSupport')}
                              />
                              Enable GIF URL Embed
                            </label>
                          </div>
                        </div>

                        {/* Control Customizers and Live Preview Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '10px' }}>
                          
                          {/* Element Sliders */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', order: 2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>Welcome Card Elements Sizing</h4>
                              <button 
                                type="button"
                                onClick={handleResetLayout}
                                className="btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                Reset Layout
                              </button>
                            </div>
                            
                            {/* Add/Remove Action Buttons */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '4px 0 12px 0', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                              <div style={{ width: '100%', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Toggle Card Elements:</div>
                              
                              {/* Profile Toggle Button */}
                              {settings.welcome.avatarEnabled !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.avatarEnabled', false)}
                                  className="btn-danger"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Trash2 size={12} /> Remove Profile
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.avatarEnabled', true)}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Plus size={12} /> Add Profile
                                </button>
                              )}

                              {/* Title Toggle Button */}
                              {settings.welcome.titleEnabled !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.titleEnabled', false)}
                                  className="btn-danger"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Trash2 size={12} /> Remove Title
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.titleEnabled', true)}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Plus size={12} /> Add Title
                                </button>
                              )}

                              {/* Username Toggle Button */}
                              {settings.welcome.usernameEnabled !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.usernameEnabled', false)}
                                  className="btn-danger"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Trash2 size={12} /> Remove Username
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.usernameEnabled', true)}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Plus size={12} /> Add Username
                                </button>
                              )}

                              {/* Subtext Toggle Button */}
                              {settings.welcome.subtextEnabled !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.subtextEnabled', false)}
                                  className="btn-danger"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Trash2 size={12} /> Remove Subtext
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('welcome.subtextEnabled', true)}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                >
                                  <Plus size={12} /> Add Subtext
                                </button>
                              )}
                            </div>
                                                        {/* Profile Picture Control Group */}
                            <div style={{ 
                              padding: '12px', 
                              borderRadius: '10px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              marginBottom: '4px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Profile Picture (Pfp)</span>
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.welcome.avatarEnabled !== false} 
                                    onChange={() => handleInputChange('welcome.avatarEnabled', !(settings.welcome.avatarEnabled !== false))}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>

                              {settings.welcome.avatarEnabled !== false ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                  {/* Avatar Size */}
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                      <span>Pfp Size</span>
                                      <span>{settings.welcome.avatarSize || 140}px</span>
                                    </div>
                                    <input 
                                      type="range" min="50" max="250" step="5"
                                      value={settings.welcome.avatarSize || 140}
                                      onChange={(e) => handleInputChange('welcome.avatarSize', parseInt(e.target.value))}
                                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                                    />
                                  </div>

                                  {/* Avatar Rotation */}
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                      <span>Pfp Rotation</span>
                                      <span>{settings.welcome.avatarRotation || 0}°</span>
                                    </div>
                                    <input 
                                      type="range" min="0" max="360" step="5"
                                      value={settings.welcome.avatarRotation || 0}
                                      onChange={(e) => handleInputChange('welcome.avatarRotation', parseInt(e.target.value))}
                                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                                    />
                                  </div>

                                  {/* Border Size & Color */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Border Thickness</span>
                                        <span>{settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6}px</span>
                                      </div>
                                      <input 
                                        type="range" min="0" max="20" step="1"
                                        value={settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6}
                                        onChange={(e) => handleInputChange('welcome.avatarBorderThickness', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Border Color</label>
                                      <input 
                                        type="color" 
                                        value={settings.welcome.avatarBorderColor || '#ffffff'}
                                        onChange={(e) => handleInputChange('welcome.avatarBorderColor', e.target.value)}
                                        style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                  Profile Picture is disabled and hidden from the welcome card.
                                </div>
                              )}
                            </div>

                            {/* Title Text Control Group */}
                            <div style={{ 
                              padding: '12px', 
                              borderRadius: '10px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              marginBottom: '4px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Title Text ("WELCOME")</span>
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.welcome.titleEnabled !== false} 
                                    onChange={() => handleInputChange('welcome.titleEnabled', !(settings.welcome.titleEnabled !== false))}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>

                              {settings.welcome.titleEnabled !== false ? (
                                <div style={{ marginTop: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <span>Title Text Size</span>
                                    <span>{settings.welcome.titleSize || 54}px</span>
                                  </div>
                                  <input 
                                    type="range" min="12" max="100" step="1"
                                    value={settings.welcome.titleSize || 54}
                                    onChange={(e) => handleInputChange('welcome.titleSize', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                  Title Text is disabled and hidden from the welcome card.
                                </div>
                              )}
                            </div>

                            {/* Username Text Control Group */}
                            <div style={{ 
                              padding: '12px', 
                              borderRadius: '10px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              marginBottom: '4px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Username Text</span>
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.welcome.usernameEnabled !== false} 
                                    onChange={() => handleInputChange('welcome.usernameEnabled', !(settings.welcome.usernameEnabled !== false))}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>

                              {settings.welcome.usernameEnabled !== false ? (
                                <div style={{ marginTop: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <span>Username Text Size</span>
                                    <span>{settings.welcome.usernameSize || 38}px</span>
                                  </div>
                                  <input 
                                    type="range" min="12" max="100" step="1"
                                    value={settings.welcome.usernameSize || 38}
                                    onChange={(e) => handleInputChange('welcome.usernameSize', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                  Username Text is disabled and hidden from the welcome card.
                                </div>
                              )}
                            </div>

                            {/* Subtext Text Control Group */}
                            <div style={{ 
                              padding: '12px', 
                              borderRadius: '10px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              marginBottom: '4px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Subtext Text</span>
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.welcome.subtextEnabled !== false} 
                                    onChange={() => handleInputChange('welcome.subtextEnabled', !(settings.welcome.subtextEnabled !== false))}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>

                              {settings.welcome.subtextEnabled !== false ? (
                                <div style={{ marginTop: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <span>Subtext Text Size</span>
                                    <span>{settings.welcome.subtextSize || 22}px</span>
                                  </div>
                                  <input 
                                    type="range" min="10" max="60" step="1"
                                    value={settings.welcome.subtextSize || 22}
                                    onChange={(e) => handleInputChange('welcome.subtextSize', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                  Subtext Text is disabled and hidden from the welcome card.
                                </div>
                              )}
                            </div>

                          </div>

                          {/* ADVANCED AESTHETICS SECTION */}
                          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '12px 0 6px 0' }} />
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: '0 0 6px 0' }}>Advanced Visual Styles</h4>
                          
                          {/* 1. Background Overlay Tint */}
                          <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Dark Background Overlay</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3) * 100)}% Opacity</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center' }}>
                              <input 
                                type="range" min="0" max="1" step="0.05"
                                value={settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3}
                                onChange={(e) => handleInputChange('welcome.overlayOpacity', parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary)' }}
                              />
                              <input 
                                type="color" 
                                value={settings.welcome.overlayColor || '#000000'}
                                onChange={(e) => handleInputChange('welcome.overlayColor', e.target.value)}
                                style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                              />
                            </div>
                          </div>

                          {/* 2. Text Shadow Effect */}
                          <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Text Shadow Glow</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adds readable shadow behind card texts</span>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={settings.welcome.textShadowEnabled || false} 
                                  onChange={() => handleToggle('welcome.textShadowEnabled')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {settings.welcome.textShadowEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span>Blur Radius</span>
                                    <span>{settings.welcome.textShadowBlur || 5}px</span>
                                  </div>
                                  <input 
                                    type="range" min="1" max="20" step="1"
                                    value={settings.welcome.textShadowBlur || 5}
                                    onChange={(e) => handleInputChange('welcome.textShadowBlur', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                  <input 
                                    type="color" 
                                    value={settings.welcome.textShadowColor || '#000000'}
                                    onChange={(e) => handleInputChange('welcome.textShadowColor', e.target.value)}
                                    style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. Avatar Shadow Glow */}
                          <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Profile Picture Glow</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Neon glow around avatar circle</span>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={settings.welcome.avatarShadowEnabled || false} 
                                  onChange={() => handleToggle('welcome.avatarShadowEnabled')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {settings.welcome.avatarShadowEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span>Glow Radius</span>
                                    <span>{settings.welcome.avatarShadowBlur || 15}px</span>
                                  </div>
                                  <input 
                                    type="range" min="1" max="40" step="1"
                                    value={settings.welcome.avatarShadowBlur || 15}
                                    onChange={(e) => handleInputChange('welcome.avatarShadowBlur', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                  <input 
                                    type="color" 
                                    value={settings.welcome.avatarShadowColor || '#2563eb'}
                                    onChange={(e) => handleInputChange('welcome.avatarShadowColor', e.target.value)}
                                    style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 4. Card Outer Border Frame */}
                          <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Outer Card Frame</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Draws frame border around canvas</span>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={settings.welcome.cardBorderEnabled || false} 
                                  onChange={() => handleToggle('welcome.cardBorderEnabled')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {settings.welcome.cardBorderEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span>Frame Thickness</span>
                                    <span>{settings.welcome.cardBorderThickness || 8}px</span>
                                  </div>
                                  <input 
                                    type="range" min="1" max="25" step="1"
                                    value={settings.welcome.cardBorderThickness || 8}
                                    onChange={(e) => handleInputChange('welcome.cardBorderThickness', parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                  <input 
                                    type="color" 
                                    value={settings.welcome.cardBorderColor || '#2563eb'}
                                    onChange={(e) => handleInputChange('welcome.cardBorderColor', e.target.value)}
                                    style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>                           {/* Live CSS Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', order: 1 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                              <Eye size={14} />
                              Interactive Preview (Drag elements to position)
                            </span>

                            <div className="glass-panel" style={{
                              width: '100%',
                              aspectRatio: '16/9',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              position: 'relative',
                              background: settings.welcome.background ? (
                                (settings.welcome.background.startsWith('#') || settings.welcome.background.length === 6 || settings.welcome.background.length === 3) 
                                ? (settings.welcome.background.startsWith('#') ? settings.welcome.background : `#${settings.welcome.background}`)
                                : `url(${resolveUploadUrl(settings.welcome.background)}) center/cover no-repeat`
                              ) : 'linear-gradient(135deg, #0F0C20 0%, #151030 50%, #060410 100%)',
                              border: (settings.welcome.cardBorderEnabled && settings.welcome.cardBorderThickness > 0)
                                ? `${settings.welcome.cardBorderThickness * 0.4}px solid ${settings.welcome.cardBorderColor || '#2563eb'}` // scaled 0.4x for preview size
                                : '1px solid rgba(255,255,255,0.05)',
                              userSelect: 'none',
                              boxSizing: 'border-box'
                            }}>
                              {/* Overlay Tint layer */}
                              {((settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3) > 0) && (
                                <div style={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  backgroundColor: settings.welcome.overlayColor || '#000000', 
                                  opacity: settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3,
                                  zIndex: 1, 
                                  pointerEvents: 'none' 
                                }} />
                              )}

                              {/* Drag items container query representation */}
                              {/* Avatar element wrapper */}
                              {settings.welcome.avatarEnabled !== false && (
                                <div 
                                  onMouseDown={(e) => handleDragStart(e, 'avatar')}
                                  onTouchStart={(e) => handleDragStart(e, 'avatar')}
                                  style={{
                                    position: 'absolute',
                                    left: `${((settings.welcome.avatarX !== undefined ? settings.welcome.avatarX : 400) / 800) * 100}%`,
                                    top: `${((settings.welcome.avatarY !== undefined ? settings.welcome.avatarY : 130) / 450) * 100}%`,
                                    width: `${((settings.welcome.avatarSize || 140) / 800) * 100}%`,
                                    aspectRatio: '1/1',
                                    transform: `translate(-50%, -50%) rotate(${settings.welcome.avatarRotation || 0}deg)`,
                                    cursor: 'move',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <img 
                                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                    alt="avatar preview"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      borderRadius: '50%',
                                      border: `${settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6}px solid ${settings.welcome.avatarBorderColor || settings.welcome.textColor || '#ffffff'}`,
                                      boxShadow: settings.welcome.avatarShadowEnabled 
                                        ? `0 0 ${(settings.welcome.avatarShadowBlur || 15) * 0.4}px ${settings.welcome.avatarShadowColor || '#2563eb'}` 
                                        : '0 4px 10px rgba(0,0,0,0.4)',
                                      pointerEvents: 'none'
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Title element wrapper */}
                              {settings.welcome.titleEnabled !== false && (
                                <div 
                                  onMouseDown={(e) => handleDragStart(e, 'title')}
                                  onTouchStart={(e) => handleDragStart(e, 'title')}
                                  style={{
                                    position: 'absolute',
                                    left: `${((settings.welcome.titleX !== undefined ? settings.welcome.titleX : 400) / 800) * 100}%`,
                                    top: `${((settings.welcome.titleY !== undefined ? settings.welcome.titleY : 260) / 450) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'move',
                                    zIndex: 9,
                                    textAlign: settings.welcome.textAlignment || 'center',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <h2 style={{
                                    fontSize: `${(settings.welcome.titleSize || 54) * 0.4}px`, // scaled for preview
                                    color: settings.welcome.textColor || '#ffffff',
                                    fontFamily: settings.welcome.fontFamily || 'Sans-Serif',
                                    fontWeight: settings.welcome.fontWeight || 'bold',
                                    letterSpacing: '2px',
                                    textShadow: settings.welcome.textShadowEnabled 
                                      ? `0 1px ${(settings.welcome.textShadowBlur || 5) * 0.4}px ${settings.welcome.textShadowColor || '#000000'}` 
                                      : '0 2px 6px rgba(0,0,0,0.6)',
                                    margin: 0,
                                    pointerEvents: 'none'
                                  }}>
                                    {(settings.welcome.titleText || 'WELCOME').replace(/{server}/g, guildName).replace(/{username}/g, (user.username || 'Member').toUpperCase())}
                                  </h2>
                                </div>
                              )}
                              
                              {/* Username element wrapper */}
                              {settings.welcome.usernameEnabled !== false && (
                                <div 
                                  onMouseDown={(e) => handleDragStart(e, 'username')}
                                  onTouchStart={(e) => handleDragStart(e, 'username')}
                                  style={{
                                    position: 'absolute',
                                    left: `${((settings.welcome.usernameX !== undefined ? settings.welcome.usernameX : 400) / 800) * 100}%`,
                                    top: `${((settings.welcome.usernameY !== undefined ? settings.welcome.usernameY : 320) / 450) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'move',
                                    zIndex: 9,
                                    textAlign: settings.welcome.textAlignment || 'center',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <h3 style={{
                                    fontSize: `${(settings.welcome.usernameSize || 38) * 0.4}px`, // scaled
                                    color: settings.welcome.usernameColor || '#2563eb',
                                    fontFamily: settings.welcome.fontFamily || 'Sans-Serif',
                                    fontWeight: settings.welcome.fontWeight || 'bold',
                                    textShadow: settings.welcome.textShadowEnabled 
                                      ? `0 1px ${(settings.welcome.textShadowBlur || 5) * 0.4}px ${settings.welcome.textShadowColor || '#000000'}` 
                                      : '0 2px 6px rgba(0,0,0,0.6)',
                                    margin: 0,
                                    pointerEvents: 'none'
                                  }}>
                                    {user.username.toUpperCase()}
                                  </h3>
                                </div>
                              )}
                              
                              {/* Subtext element wrapper */}
                              {settings.welcome.subtextEnabled !== false && (
                                <div 
                                  onMouseDown={(e) => handleDragStart(e, 'subtext')}
                                  onTouchStart={(e) => handleDragStart(e, 'subtext')}
                                  style={{
                                    position: 'absolute',
                                    left: `${((settings.welcome.subtextX !== undefined ? settings.welcome.subtextX : 400) / 800) * 100}%`,
                                    top: `${((settings.welcome.subtextY !== undefined ? settings.welcome.subtextY : 370) / 450) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'move',
                                    zIndex: 9,
                                    textAlign: settings.welcome.textAlignment || 'center',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <p style={{
                                    fontSize: `${(settings.welcome.subtextSize || 22) * 0.4}px`, // scaled
                                    color: settings.welcome.subtextColor || 'rgba(255,255,255,0.8)',
                                    fontFamily: settings.welcome.fontFamily || 'Sans-Serif',
                                    fontWeight: settings.welcome.fontWeight || 'bold',
                                    textShadow: settings.welcome.textShadowEnabled 
                                      ? `0 1px ${(settings.welcome.textShadowBlur || 5) * 0.4}px ${settings.welcome.textShadowColor || '#000000'}` 
                                      : '0 1px 4px rgba(0,0,0,0.6)',
                                    margin: 0,
                                    pointerEvents: 'none'
                                  }}>
                                    {(settings.welcome.subtextText || 'TO {server}').replace(/{server}/g, guildName).replace(/{username}/g, (user.username || 'Member').toUpperCase())}
                                  </p>
                                </div>
                              )}

                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                              💡 Reposition elements inside the banner by clicking and dragging them!
                            </span>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VERIFICATION */}
              {activeTab === 'verification' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Verification System</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Ensure security by requiring new members to verify their accounts to access your server channels.</p>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{ 
                      flex: '1 1 500px',
                      padding: '24px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Role Assignment Verification</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Users must verify themselves to receive a member role.</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={settings.verification.enabled} 
                            onChange={() => handleToggle('verification.enabled')}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      {settings.verification.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          
                          {/* Verification Method Selection */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Verification Method</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                              {[
                                { id: 'button', title: 'Discord Button', desc: 'Click an interactive button to verify' },
                                { id: 'reaction', title: 'Emoji Reaction', desc: 'React with an emoji to verify (Reaction Role)' }
                              ].map(methodOption => (
                                <div
                                  key={methodOption.id}
                                  onClick={() => handleInputChange('verification.type', methodOption.id)}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                    backgroundColor: settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                >
                                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? '#ffffff' : 'var(--text-secondary)' }}>
                                    {methodOption.title}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1rem' }}>
                                    {methodOption.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Channel and Role selection */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verification Channel</label>
                              <select 
                                value={settings.verification.channelId}
                                onChange={(e) => handleInputChange('verification.channelId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role to Grant upon Verification</label>
                              <select 
                                value={settings.verification.roleId}
                                onChange={(e) => handleInputChange('verification.roleId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Role --</option>
                                {roles.map(role => (
                                  <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Conditional Text Fields based on type */}
                          {settings.verification.type === 'reaction' ? (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Reaction Emoji</label>
                              <input 
                                type="text" 
                                value={settings.verification.reactionEmoji || '✅'}
                                onChange={(e) => handleInputChange('verification.reactionEmoji', e.target.value)}
                                className="glass-input"
                                style={{ maxWidth: '200px' }}
                                placeholder="e.g. ✅ or custom emoji"
                              />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                Use a standard emoji (like ✅, ⭐, 👍) or a custom server emoji.
                              </span>
                            </div>
                          ) : (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verify Button Label</label>
                              <input 
                                type="text" 
                                value={settings.verification.buttonText || 'Verify'}
                                onChange={(e) => handleInputChange('verification.buttonText', e.target.value)}
                                className="glass-input"
                                placeholder="Verify"
                              />
                            </div>
                          )}

                          {/* Embed Description */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verification Embed Description</label>
                            <textarea 
                              rows="3"
                              value={settings.verification.welcomeMessage || ''}
                              onChange={(e) => handleInputChange('verification.welcomeMessage', e.target.value)}
                              className="glass-input"
                              placeholder={
                                settings.verification.type === 'reaction'
                                  ? 'React to this message with the emoji below to verify and gain access to the server.'
                                  : 'Click the button below to verify your account and gain access to the server.'
                              }
                            />
                          </div>

                          {/* Publish Panel card */}
                          <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'var(--primary-glow)' }}>
                            <div>
                              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>Publish Panel to Discord</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send the verification box with the interactive button/reaction directly to the selected channel.</p>
                            </div>
                            <button 
                              type="button"
                              onClick={handlePublishVerification} 
                              disabled={saving || !settings.verification.channelId || !settings.verification.roleId}
                              className="btn-success"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Publish Embed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{ 
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky', 
                      top: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      {settings.verification.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <DiscordMessagePreview 
                            botUser={{ username: user?.username }}
                            guildName={guildName}
                            guildIcon={guildIcon}
                            message=""
                            buttonEnabled={settings.verification.type !== 'reaction'}
                            buttonLabel={settings.verification.buttonText || 'Verify'}
                            buttonUrl=""
                            embedEnabled={true}
                            embedTitle="Verification Required"
                            embedDesc={settings.verification.welcomeMessage || (
                              settings.verification.type === 'reaction'
                                ? 'React to this message with the emoji below to verify and gain access to the server.'
                                : 'Click the button below to verify your account and gain access to the server.'
                            )}
                            embedColor="#2563eb"
                            embedThumb=""
                            embedImage=""
                            isDM={false}
                          />
                          {/* Reaction Emoji rendering beneath the preview if reaction type */}
                          {settings.verification.type === 'reaction' && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#2b2d31',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              width: 'fit-content',
                              marginLeft: '56px',
                              gap: '6px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              userSelect: 'none'
                            }}>
                              <span style={{ fontSize: '1.15rem' }}>{settings.verification.reactionEmoji || '✅'}</span>
                              <span style={{ fontSize: '0.8rem', color: '#949ba4', fontWeight: 'bold' }}>1</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: TICKET SYSTEM */}
              {activeTab === 'tickets' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Ticket System</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create support categories, assign support roles, and allow users to open private support channels.</p>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{ 
                      flex: '1 1 500px',
                      padding: '24px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px' 
                    }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Enable Ticket System</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Activate the support tickets functionality on your server.</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={settings.tickets?.enabled || false} 
                            onChange={() => handleToggle('tickets.enabled')}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      {settings.tickets?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ticket Panel Channel</label>
                              <select 
                                value={settings.tickets.channelId || ''}
                                onChange={(e) => handleInputChange('tickets.channelId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ticket Parent Category</label>
                              <select 
                                value={settings.tickets.categoryId || ''}
                                onChange={(e) => handleInputChange('tickets.categoryId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Category --</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Support Team Role</label>
                              <select 
                                value={settings.tickets.supportRoleId || ''}
                                onChange={(e) => handleInputChange('tickets.supportRoleId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Role --</option>
                                {roles.map(role => (
                                  <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Panel Button Label</label>
                              <input 
                                type="text" 
                                value={settings.tickets.buttonText || ''}
                                onChange={(e) => handleInputChange('tickets.buttonText', e.target.value)}
                                className="glass-input"
                                placeholder="Create Ticket"
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Panel Embed Title</label>
                              <input 
                                type="text" 
                                value={settings.tickets.title || ''}
                                onChange={(e) => handleInputChange('tickets.title', e.target.value)}
                                className="glass-input"
                                placeholder="Support Ticket"
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Panel Embed Description</label>
                            <textarea 
                              rows="3"
                              value={settings.tickets.welcomeMessage || ''}
                              onChange={(e) => handleInputChange('tickets.welcomeMessage', e.target.value)}
                              className="glass-input"
                              placeholder="Click the button below to open a ticket. Our support team will help you shortly."
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ticket Channel Welcome Message (Supports {`{user}`}, {`{server}`})</label>
                            <textarea 
                              rows="3"
                              value={settings.tickets.ticketMessage || ''}
                              onChange={(e) => handleInputChange('tickets.ticketMessage', e.target.value)}
                              className="glass-input"
                              placeholder="Welcome {user}! Please describe your issue. Support staff will assist you shortly."
                            />
                          </div>

                          <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            <div>
                              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>Publish Panel to Discord</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send the support ticket box with the interactive button directly to the selected channel.</p>
                            </div>
                            <button 
                              type="button"
                              onClick={handlePublishTickets} 
                              disabled={saving || !settings.tickets.channelId}
                              className="btn-success"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Publish Embed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{ 
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky', 
                      top: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      {settings.tickets?.enabled && (
                        <DiscordMessagePreview 
                          botUser={{ username: user?.username }}
                          guildName={guildName}
                          guildIcon={guildIcon}
                          message=""
                          buttonEnabled={true}
                          buttonLabel={settings.tickets.buttonText || 'Create Ticket'}
                          buttonUrl=""
                          embedEnabled={true}
                          embedTitle={settings.tickets.title || 'Support Ticket'}
                          embedDesc={settings.tickets.welcomeMessage || 'Click the button below to open a ticket. Our support team will help you shortly.'}
                          embedColor="#2563eb"
                          embedThumb=""
                          embedImage=""
                          isDM={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ROLES & NICKNAMES */}
              {activeTab === 'roles' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Roles & Nicknames</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Automatically assign roles and structure nickname formatting when members join your server.</p>

                  {/* Auto Role Card */}
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Auto Role on Join</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automatically assigns a specific role as soon as a user joins the server.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.autoRole.enabled} 
                          onChange={() => handleToggle('autoRole.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.autoRole.enabled && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role to Auto-Assign</label>
                        <select 
                          value={settings.autoRole.roleId}
                          onChange={(e) => handleInputChange('autoRole.roleId', e.target.value)}
                          className="glass-input"
                          style={{ maxWidth: '300px' }}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Auto Nickname Card */}
                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Auto Nickname Formatter</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automatically renames new users matching your server nickname format guidelines.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.autoNickname.enabled} 
                          onChange={() => handleToggle('autoNickname.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.autoNickname.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nickname Format (Supports {`{username}`} for Display Name)</label>
                          <input 
                            type="text" 
                            value={settings.autoNickname.format}
                            onChange={(e) => handleInputChange('autoNickname.format', e.target.value)}
                            className="glass-input"
                            style={{ maxWidth: '400px' }}
                            placeholder="Member | {username}"
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Example: If set to "Member | {`{username}`}", a user joining as "Yadav" becomes "Member | Yadav".</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SERVER LOGS */}
              {activeTab === 'logs' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Server Moderation Logs</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Real-time stream of moderation and administrative actions taken in the server.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
                    {logs.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No moderation logs available. Live monitoring is active.</p>
                      </div>
                    ) : (
                      logs.map((log, idx) => {
                        let badgeColor = 'var(--text-secondary)';
                        let badgeBg = 'rgba(255,255,255,0.05)';
                        let actionLabel = (log.actionType || 'action').toUpperCase();

                        if (log.actionType === 'timeout') {
                          badgeColor = 'var(--warning)';
                          badgeBg = 'rgba(251, 191, 36, 0.1)';
                        } else if (log.actionType === 'ban') {
                          badgeColor = 'var(--danger)';
                          badgeBg = 'rgba(244, 63, 94, 0.1)';
                        } else if (log.actionType === 'kick') {
                          badgeColor = '#f97316';
                          badgeBg = 'rgba(249, 115, 22, 0.1)';
                        } else if (log.actionType === 'warn') {
                          badgeColor = '#fbbf24';
                          badgeBg = 'rgba(251, 191, 36, 0.1)';
                        } else if (log.actionType === 'message_delete') {
                          badgeColor = '#3b82f6';
                          badgeBg = 'rgba(59, 130, 246, 0.1)';
                          actionLabel = 'DELETE';
                        } else if (log.actionType === 'role_update') {
                          badgeColor = 'var(--secondary)';
                          badgeBg = 'rgba(6, 182, 212, 0.1)';
                          actionLabel = 'ROLES';
                        }

                        const modAvatar = (log.moderator && log.moderator.avatar && log.moderator.id)
                          ? `https://cdn.discordapp.com/avatars/${log.moderator.id}/${log.moderator.avatar}.png`
                          : 'https://cdn.discordapp.com/embed/avatars/0.png';
                        
                        const targetAvatar = (log.target && log.target.avatar && log.target.id)
                          ? `https://cdn.discordapp.com/avatars/${log.target.id}/${log.target.avatar}.png`
                          : 'https://cdn.discordapp.com/embed/avatars/0.png';

                        return (
                          <div 
                            key={log._id || idx} 
                            className="glass-panel" 
                            style={{ 
                              padding: '14px 18px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              gap: '16px',
                              backgroundColor: 'rgba(255,255,255,0.01)',
                              borderLeft: `4px solid ${badgeColor}`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '54px', height: '32px', flexShrink: 0 }}>
                                <img 
                                  src={modAvatar} 
                                  alt="Mod" 
                                  title={`Moderator: ${log.moderator?.username || 'Unknown Moderator'}`}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--border-color)', position: 'absolute', left: 0, zIndex: 2 }}
                                />
                                <img 
                                  src={targetAvatar} 
                                  alt="User" 
                                  title={`User: ${log.target?.username || 'Unknown User'}`}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--primary)', position: 'absolute', left: '18px', zIndex: 1 }}
                                />
                              </div>

                              <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                  <span style={{ color: 'var(--text-primary)' }}>{log.moderator?.username || 'Unknown Moderator'}</span>
                                  <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}> performed action on </span>
                                  <span style={{ color: 'var(--primary)' }}>{log.target?.username || 'Unknown User'}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {log.details}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                              <span style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '700', 
                                padding: '2px 8px', 
                                borderRadius: '10px',
                                color: badgeColor,
                                backgroundColor: badgeBg,
                                border: `1px solid ${badgeColor}22`
                              }}>
                                {actionLabel}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Unknown Time'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
               {/* TAB 7: BROADCAST DMS */}
              {activeTab === 'broadcast' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Mass DM Broadcast</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Draft and send a direct message broadcast to all server members immediately.</p>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{ 
                      flex: '1 1 500px',
                      padding: '24px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px' 
                    }}>
                      


                      {/* Message Textarea */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Message Content</label>
                        <textarea 
                          rows="4" 
                          value={broadcastMessage} 
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          maxLength={2000}
                          className="glass-input"
                          placeholder="Hello {username}! Check out our new bot features..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Placeholders: Use <code>{`{username}`}</code> to name/mention the member, and <code>{`{server}`}</code> to insert the server name.
                          </span>
                          <span style={{ fontSize: '0.75rem', color: broadcastMessage.length >= 1900 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {broadcastMessage.length} / 2000
                          </span>
                        </div>
                      </div>

                      {/* Multiple Link Buttons Settings panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastButtons.length > 0 ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Link Buttons (Up to 3)</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Adds clickable link buttons at the bottom of the message.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              if (broadcastButtons.length < 3) {
                                setBroadcastButtons([...broadcastButtons, { label: '', url: '' }]);
                              }
                            }}
                            disabled={broadcastButtons.length >= 3}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: broadcastButtons.length >= 3 ? 0.5 : 1, cursor: broadcastButtons.length >= 3 ? 'not-allowed' : 'pointer' }}
                          >
                            + Add Button
                          </button>
                        </div>

                        {broadcastButtons.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {broadcastButtons.map((btn, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} Label</label>
                                  <input 
                                    type="text" 
                                    value={btn.label}
                                    onChange={(e) => {
                                      const updated = [...broadcastButtons];
                                      updated[idx].label = e.target.value;
                                      setBroadcastButtons(updated);
                                    }}
                                    className="glass-input" 
                                    placeholder="e.g. Website"
                                  />
                                </div>
                                <div style={{ flex: 2 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} URL</label>
                                  <input 
                                    type="text" 
                                    value={btn.url}
                                    onChange={(e) => {
                                      const updated = [...broadcastButtons];
                                      updated[idx].url = e.target.value;
                                      setBroadcastButtons(updated);
                                    }}
                                    className="glass-input" 
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setBroadcastButtons(broadcastButtons.filter((_, i) => i !== idx));
                                  }}
                                  className="btn-danger"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Legacy fallback toggle to show one single button if none are explicitly in the array */
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick Button Toggle</span>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={broadcastButtonEnabled} 
                                  onChange={(e) => setBroadcastButtonEnabled(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {broadcastButtonEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button Label</label>
                                  <input 
                                    type="text" 
                                    value={broadcastButtonLabel}
                                    onChange={(e) => setBroadcastButtonLabel(e.target.value)}
                                    className="glass-input" 
                                    placeholder="e.g. Visit Website"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button URL</label>
                                  <input 
                                    type="text" 
                                    value={broadcastButtonUrl}
                                    onChange={(e) => setBroadcastButtonUrl(e.target.value)}
                                    className="glass-input" 
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Embed Builder sub-panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastEmbedEnabled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Rich Embed</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Creates a beautifully styled embed card with custom color, title, and media links.</p>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={broadcastEmbedEnabled} 
                              onChange={(e) => setBroadcastEmbedEnabled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {broadcastEmbedEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Author Customization */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Author</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={broadcastEmbedAuthorEnabled} 
                                    onChange={(e) => setBroadcastEmbedAuthorEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {broadcastEmbedAuthorEnabled && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Name</label>
                                      <input 
                                        type="text" 
                                        value={broadcastEmbedAuthorName}
                                        onChange={(e) => setBroadcastEmbedAuthorName(e.target.value)}
                                        className="glass-input" 
                                        placeholder="e.g. Server Owner"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Icon URL</label>
                                      <input 
                                        type="text" 
                                        value={broadcastEmbedAuthorIcon}
                                        onChange={(e) => setBroadcastEmbedAuthorIcon(e.target.value)}
                                        className="glass-input" 
                                        placeholder="https://example.com/icon.png"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Click URL</label>
                                    <input 
                                      type="text" 
                                      value={broadcastEmbedAuthorUrl}
                                      onChange={(e) => setBroadcastEmbedAuthorUrl(e.target.value)}
                                      className="glass-input" 
                                      placeholder="https://example.com"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Embed Title & Sidebar Color */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Title</label>
                                <input 
                                  type="text" 
                                  value={broadcastEmbedTitle}
                                  onChange={(e) => setBroadcastEmbedTitle(e.target.value)}
                                  className="glass-input" 
                                  placeholder="Embed Title"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sidebar Color</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input 
                                    type="color" 
                                    value={broadcastEmbedColor}
                                    onChange={(e) => setBroadcastEmbedColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                  />
                                  <input 
                                    type="text" 
                                    value={broadcastEmbedColor}
                                    onChange={(e) => setBroadcastEmbedColor(e.target.value)}
                                    className="glass-input" 
                                    placeholder="#2563eb"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Embed Description */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Description</label>
                              <textarea 
                                rows="3" 
                                value={broadcastEmbedDesc}
                                onChange={(e) => setBroadcastEmbedDesc(e.target.value)}
                                maxLength={4000}
                                className="glass-input" 
                                placeholder="Rich description..."
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: broadcastEmbedDesc.length >= 3800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {broadcastEmbedDesc.length} / 4000
                                </span>
                              </div>
                            </div>

                            {/* Embed Fields Section */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Embed Fields (Up to 5)</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    if (broadcastEmbedFields.length < 5) {
                                      setBroadcastEmbedFields([...broadcastEmbedFields, { name: '', value: '', inline: true }]);
                                    }
                                  }} 
                                  disabled={broadcastEmbedFields.length >= 5}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: broadcastEmbedFields.length >= 5 ? 0.5 : 1, cursor: broadcastEmbedFields.length >= 5 ? 'not-allowed' : 'pointer' }}
                                >
                                  + Add Field
                                </button>
                              </div>
                              
                              {broadcastEmbedFields.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                  {broadcastEmbedFields.map((fld, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Field #{idx + 1}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input 
                                              type="checkbox" 
                                              checked={fld.inline} 
                                              onChange={(e) => {
                                                const updated = [...broadcastEmbedFields];
                                                updated[idx].inline = e.target.checked;
                                                setBroadcastEmbedFields(updated);
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            Inline Grid Layout
                                          </label>
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setBroadcastEmbedFields(broadcastEmbedFields.filter((_, i) => i !== idx));
                                            }}
                                            className="btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Name</label>
                                          <input 
                                            type="text" 
                                            value={fld.name}
                                            onChange={(e) => {
                                              const updated = [...broadcastEmbedFields];
                                              updated[idx].name = e.target.value;
                                              setBroadcastEmbedFields(updated);
                                            }}
                                            className="glass-input" 
                                            placeholder="Field Title"
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Value</label>
                                          <textarea 
                                            rows="1" 
                                            value={fld.value}
                                            onChange={(e) => {
                                              const updated = [...broadcastEmbedFields];
                                              updated[idx].value = e.target.value;
                                              setBroadcastEmbedFields(updated);
                                            }}
                                            className="glass-input" 
                                            placeholder="Field Content"
                                            style={{ minHeight: '38px', resize: 'vertical' }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Embed Thumbnail & Image */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                                <input 
                                  type="text" 
                                  value={broadcastEmbedThumb}
                                  onChange={(e) => setBroadcastEmbedThumb(e.target.value)}
                                  className="glass-input" 
                                  placeholder="https://example.com/thumbnail.png"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Large Image URL</label>
                                <input 
                                  type="text" 
                                  value={broadcastEmbedImage}
                                  onChange={(e) => setBroadcastEmbedImage(e.target.value)}
                                  className="glass-input" 
                                  placeholder="https://example.com/banner.png"
                                />
                              </div>
                            </div>

                            {/* Footer Customization */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Footer</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={broadcastEmbedFooterEnabled} 
                                    onChange={(e) => setBroadcastEmbedFooterEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {broadcastEmbedFooterEnabled && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Text</label>
                                    <input 
                                      type="text" 
                                      value={broadcastEmbedFooterText}
                                      onChange={(e) => setBroadcastEmbedFooterText(e.target.value)}
                                      className="glass-input" 
                                      placeholder="Footer Text"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Icon URL</label>
                                    <input 
                                      type="text" 
                                      value={broadcastEmbedFooterIcon}
                                      onChange={(e) => setBroadcastEmbedFooterIcon(e.target.value)}
                                      className="glass-input" 
                                      placeholder="https://example.com/footer-icon.png"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Manager Section */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0' }}>Save or Load Templates</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <input 
                              type="text" 
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="glass-input" 
                              placeholder="Template Name (e.g. Promo DM)"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (templateName.trim()) {
                                handleSaveTemplate(templateName, 'dm');
                                setTemplateName('');
                              }
                            }}
                            className="btn-success"
                            style={{ height: '40px', padding: '0 16px', fontSize: '0.85rem' }}
                          >
                            Save Draft
                          </button>
                        </div>

                        {templates.length > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Saved DM Templates</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {templates.map(tpl => (
                                <div key={tpl._id} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                  <span 
                                    onClick={() => handleLoadTemplate(tpl)} 
                                    style={{ cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                  >
                                    {tpl.name}
                                  </span>
                                  <Trash2 
                                    size={12} 
                                    style={{ color: 'var(--danger)', cursor: 'pointer' }} 
                                    onClick={() => handleDeleteTemplate(tpl._id, 'dm')}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delivery & Scheduling Settings */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Delivery & Scheduling Settings</h4>
                        
                        {/* Delay Slider */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Stagger Interval Delay: <strong style={{ color: 'var(--primary)' }}>{broadcastDelayInterval} second{broadcastDelayInterval !== 1 ? 's' : ''}</strong>
                            </label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protects against API rate limits</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="1"
                            value={broadcastDelayInterval} 
                            onChange={(e) => setBroadcastDelayInterval(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                        </div>

                        {/* Scheduling Toggle & Input */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastIsScheduled ? '12px' : '0' }}>
                            <div>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Schedule Broadcast for Later</span>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Queue this broadcast to run at a specific future date and time.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={broadcastIsScheduled} 
                                onChange={(e) => setBroadcastIsScheduled(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          {broadcastIsScheduled && (
                            <div style={{ marginTop: '12px' }}>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Release Date & Time</label>
                              <input 
                                type="datetime-local" 
                                value={broadcastScheduledTime}
                                onChange={(e) => setBroadcastScheduledTime(e.target.value)}
                                className="glass-input" 
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mass DM Warning Banner */}
                      <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <h4 style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>⚠️ Mass DM rate limit & safety warning</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                          The bot sends direct messages to members using a **{broadcastDelayInterval}-second interval** to protect your bot from getting flagged as spam. Please be patient while the broadcast runs in the background. 
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button 
                          type="button" 
                          onClick={handleSendTestDM} 
                          disabled={broadcasting} 
                          className="btn-secondary"
                          style={{ gap: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '42px', padding: '0 16px', fontSize: '0.85rem' }}
                        >
                          <Eye size={18} />
                          Send Test DM
                        </button>
                        <button 
                          type="button" 
                          onClick={handleSendBroadcast} 
                          disabled={broadcasting} 
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '42px', padding: '0 20px', fontSize: '0.85rem' }}
                        >
                          <Send size={18} />
                          {broadcasting ? 'Broadcasting DMs...' : (broadcastIsScheduled ? 'Schedule DM Broadcast' : 'Send DMs to Members')}
                        </button>
                      </div>

                      {/* Pending Scheduled DMs List */}
                      {scheduledDMs.length > 0 && (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.02)', marginTop: '20px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Pending Scheduled DMs ({scheduledDMs.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheduledDMs.map(dm => {
                              return (
                                <div key={dm._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                      {dm.message || (dm.embed && dm.embed.title) || 'Embed Only DM'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Publishing at {new Date(dm.publishAt).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delay: {dm.delayInterval}s | Roles: Filter: {roles.find(r => r.id === dm.filterRole)?.name || 'None'} / Exclude: {roles.find(r => r.id === dm.excludeRole)?.name || 'None'}</div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => handleDeleteScheduledDM(dm._id)}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}



                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{ 
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky', 
                      top: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview 
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={broadcastMessage}
                        buttonEnabled={broadcastButtonEnabled}
                        buttonLabel={broadcastButtonLabel}
                        buttonUrl={broadcastButtonUrl}
                        embedEnabled={broadcastEmbedEnabled}
                        embedTitle={broadcastEmbedTitle}
                        embedDesc={broadcastEmbedDesc}
                        embedColor={broadcastEmbedColor}
                        embedThumb={broadcastEmbedThumb}
                        embedImage={broadcastEmbedImage}
                        isDM={true}
                        embedAuthorEnabled={broadcastEmbedAuthorEnabled}
                        embedAuthorName={broadcastEmbedAuthorName}
                        embedAuthorIcon={broadcastEmbedAuthorIcon}
                        embedAuthorUrl={broadcastEmbedAuthorUrl}
                        embedFooterEnabled={broadcastEmbedFooterEnabled}
                        embedFooterText={broadcastEmbedFooterText}
                        embedFooterIcon={broadcastEmbedFooterIcon}
                        embedFields={broadcastEmbedFields}
                        buttons={broadcastButtons.length > 0 ? broadcastButtons : (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl ? [{ label: broadcastButtonLabel, url: broadcastButtonUrl }] : [])}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PUBLISH ANNOUNCEMENT */}
              {activeTab === 'publish' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Publish Announcement</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Send styled messages, embeds, link buttons, images, and GIFs to a selected server channel.</p>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{ 
                      flex: '1 1 500px',
                      padding: '24px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px' 
                    }}>
                      
                      {/* Target Channel & Ping Target Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {/* Target Channel Dropdown */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Target Channel</label>
                          <select 
                            value={pubChannelId}
                            onChange={(e) => setPubChannelId(e.target.value)}
                            className="glass-input"
                          >
                            <option value="">-- Select text channel --</option>
                            {channels.map(ch => (
                              <option key={ch.id} value={ch.id}>#{ch.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Ping Target Select */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ping Target (Mentions)</label>
                          <select 
                            value={pubPingType}
                            onChange={(e) => setPubPingType(e.target.value)}
                            className="glass-input"
                          >
                            <option value="none">No Mention</option>
                            <option value="everyone">@everyone</option>
                            <option value="here">@here</option>
                            <option value="role">Specific Role...</option>
                          </select>
                        </div>
                      </div>

                      {/* Specific Role Dropdown */}
                      {pubPingType === 'role' && (
                        <div style={{ marginTop: '-4px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Role to Ping</label>
                          <select 
                            value={pubPingRoleId}
                            onChange={(e) => setPubPingRoleId(e.target.value)}
                            className="glass-input"
                          >
                            <option value="">-- Select server role --</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id} style={{ color: r.color }}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Message Textarea */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Message Content</label>
                        <textarea 
                          rows="4" 
                          value={pubMessage} 
                          onChange={(e) => setPubMessage(e.target.value)}
                          maxLength={2000}
                          className="glass-input"
                          placeholder="Type your channel message here..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Placeholders: Use <code>{`{server}`}</code> to insert the server name.
                          </span>
                          <span style={{ fontSize: '0.75rem', color: pubMessage.length >= 1900 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {pubMessage.length} / 2000
                          </span>
                        </div>
                      </div>

                      {/* Multiple Link Buttons Settings panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pubButtons.length > 0 ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Link Buttons (Up to 3)</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Adds clickable link buttons at the bottom of the message.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              if (pubButtons.length < 3) {
                                setPubButtons([...pubButtons, { label: '', url: '' }]);
                              }
                            }}
                            disabled={pubButtons.length >= 3}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: pubButtons.length >= 3 ? 0.5 : 1, cursor: pubButtons.length >= 3 ? 'not-allowed' : 'pointer' }}
                          >
                            + Add Button
                          </button>
                        </div>

                        {pubButtons.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pubButtons.map((btn, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} Label</label>
                                  <input 
                                    type="text" 
                                    value={btn.label}
                                    onChange={(e) => {
                                      const updated = [...pubButtons];
                                      updated[idx].label = e.target.value;
                                      setPubButtons(updated);
                                    }}
                                    className="glass-input" 
                                    placeholder="e.g. Website"
                                  />
                                </div>
                                <div style={{ flex: 2 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} URL</label>
                                  <input 
                                    type="text" 
                                    value={btn.url}
                                    onChange={(e) => {
                                      const updated = [...pubButtons];
                                      updated[idx].url = e.target.value;
                                      setPubButtons(updated);
                                    }}
                                    className="glass-input" 
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setPubButtons(pubButtons.filter((_, i) => i !== idx));
                                  }}
                                  className="btn-danger"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Legacy fallback toggle to show one single button if none are explicitly in the array */
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick Button Toggle</span>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={pubButtonEnabled} 
                                  onChange={(e) => setPubButtonEnabled(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {pubButtonEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button Label</label>
                                  <input 
                                    type="text" 
                                    value={pubButtonLabel}
                                    onChange={(e) => setPubButtonLabel(e.target.value)}
                                    className="glass-input" 
                                    placeholder="e.g. Visit Website"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button URL</label>
                                  <input 
                                    type="text" 
                                    value={pubButtonUrl}
                                    onChange={(e) => setPubButtonUrl(e.target.value)}
                                    className="glass-input" 
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Embed Builder sub-panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pubEmbedEnabled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Rich Embed</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Creates a beautifully styled embed card with custom color, title, and media links.</p>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={pubEmbedEnabled} 
                              onChange={(e) => setPubEmbedEnabled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {pubEmbedEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Author customization */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Author</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={pubEmbedAuthorEnabled} 
                                    onChange={(e) => setPubEmbedAuthorEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {pubEmbedAuthorEnabled && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Name</label>
                                      <input 
                                        type="text" 
                                        value={pubEmbedAuthorName}
                                        onChange={(e) => setPubEmbedAuthorName(e.target.value)}
                                        className="glass-input" 
                                        placeholder="e.g. Server Owner"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Icon URL</label>
                                      <input 
                                        type="text" 
                                        value={pubEmbedAuthorIcon}
                                        onChange={(e) => setPubEmbedAuthorIcon(e.target.value)}
                                        className="glass-input" 
                                        placeholder="https://example.com/icon.png"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Click URL</label>
                                    <input 
                                      type="text" 
                                      value={pubEmbedAuthorUrl}
                                      onChange={(e) => setPubEmbedAuthorUrl(e.target.value)}
                                      className="glass-input" 
                                      placeholder="https://example.com"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Embed Title & Color */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Title</label>
                                <input 
                                  type="text" 
                                  value={pubEmbedTitle}
                                  onChange={(e) => setPubEmbedTitle(e.target.value)}
                                  className="glass-input" 
                                  placeholder="Embed Title"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sidebar Color</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input 
                                    type="color" 
                                    value={pubEmbedColor}
                                    onChange={(e) => setPubEmbedColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                  />
                                  <input 
                                    type="text" 
                                    value={pubEmbedColor}
                                    onChange={(e) => setPubEmbedColor(e.target.value)}
                                    className="glass-input" 
                                    placeholder="#2563eb"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Embed Description */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Description</label>
                              <textarea 
                                rows="3" 
                                value={pubEmbedDesc}
                                onChange={(e) => setPubEmbedDesc(e.target.value)}
                                maxLength={4000}
                                className="glass-input" 
                                placeholder="Rich description..."
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: pubEmbedDesc.length >= 3800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {pubEmbedDesc.length} / 4000
                                </span>
                              </div>
                            </div>

                            {/* Embed Fields Section */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Embed Fields (Up to 5)</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    if (pubEmbedFields.length < 5) {
                                      setPubEmbedFields([...pubEmbedFields, { name: '', value: '', inline: true }]);
                                    }
                                  }} 
                                  disabled={pubEmbedFields.length >= 5}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: pubEmbedFields.length >= 5 ? 0.5 : 1, cursor: pubEmbedFields.length >= 5 ? 'not-allowed' : 'pointer' }}
                                >
                                  + Add Field
                                </button>
                              </div>
                              
                              {pubEmbedFields.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                  {pubEmbedFields.map((fld, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Field #{idx + 1}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input 
                                              type="checkbox" 
                                              checked={fld.inline} 
                                              onChange={(e) => {
                                                const updated = [...pubEmbedFields];
                                                updated[idx].inline = e.target.checked;
                                                setPubEmbedFields(updated);
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            Inline Grid Layout
                                          </label>
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setPubEmbedFields(pubEmbedFields.filter((_, i) => i !== idx));
                                            }}
                                            className="btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Name</label>
                                          <input 
                                            type="text" 
                                            value={fld.name}
                                            onChange={(e) => {
                                              const updated = [...pubEmbedFields];
                                              updated[idx].name = e.target.value;
                                              setPubEmbedFields(updated);
                                            }}
                                            className="glass-input" 
                                            placeholder="Field Title (e.g. Server Rules)"
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Value</label>
                                          <textarea 
                                            rows="1" 
                                            value={fld.value}
                                            onChange={(e) => {
                                              const updated = [...pubEmbedFields];
                                              updated[idx].value = e.target.value;
                                              setPubEmbedFields(updated);
                                            }}
                                            className="glass-input" 
                                            placeholder="Field Content"
                                            style={{ minHeight: '38px', resize: 'vertical' }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Embed Thumbnail & Image */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                                <input 
                                  type="text" 
                                  value={pubEmbedThumb}
                                  onChange={(e) => setPubEmbedThumb(e.target.value)}
                                  className="glass-input" 
                                  placeholder="https://example.com/thumbnail.png"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Large Image / GIF URL</label>
                                <input 
                                  type="text" 
                                  value={pubEmbedImage}
                                  onChange={(e) => setPubEmbedImage(e.target.value)}
                                  className="glass-input" 
                                  placeholder="https://example.com/banner.png or GIF URL"
                                />
                              </div>
                            </div>

                            {/* Footer customization */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Footer</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={pubEmbedFooterEnabled} 
                                    onChange={(e) => setPubEmbedFooterEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {pubEmbedFooterEnabled && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Text</label>
                                    <input 
                                      type="text" 
                                      value={pubEmbedFooterText}
                                      onChange={(e) => setPubEmbedFooterText(e.target.value)}
                                      className="glass-input" 
                                      placeholder="Footer Text"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Icon URL</label>
                                    <input 
                                      type="text" 
                                      value={pubEmbedFooterIcon}
                                      onChange={(e) => setPubEmbedFooterIcon(e.target.value)}
                                      className="glass-input" 
                                      placeholder="https://example.com/footer-icon.png"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Manager Section */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0' }}>Save or Load Templates</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <input 
                              type="text" 
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="glass-input" 
                              placeholder="Template Name (e.g. Rules Post)"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (templateName.trim()) {
                                handleSaveTemplate(templateName, 'announcement');
                                setTemplateName('');
                              }
                            }}
                            className="btn-success"
                            style={{ height: '40px', padding: '0 16px', fontSize: '0.85rem' }}
                          >
                            Save Draft
                          </button>
                        </div>

                        {templates.length > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Saved Announcement Templates</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {templates.map(tpl => (
                                <div key={tpl._id} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                  <span 
                                    onClick={() => handleLoadTemplate(tpl)} 
                                    style={{ cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                  >
                                    {tpl.name}
                                  </span>
                                  <Trash2 
                                    size={12} 
                                    style={{ color: 'var(--danger)', cursor: 'pointer' }} 
                                    onClick={() => handleDeleteTemplate(tpl._id, 'announcement')}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Announcement Options */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isScheduled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Schedule Publication</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Publish this announcement automatically at a future date & time.</p>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={isScheduled} 
                              onChange={(e) => setIsScheduled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {isScheduled && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Release Date & Time</label>
                            <input 
                              type="datetime-local" 
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                              className="glass-input" 
                              style={{ width: '100%' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Pending Scheduled Announcements List */}
                      {scheduledAnnouncements.length > 0 && (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.02)' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Pending Scheduled Announcements ({scheduledAnnouncements.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheduledAnnouncements.map(ann => {
                              const targetCh = channels.find(c => c.id === ann.channelId)?.name || 'unknown-channel';
                              return (
                                <div key={ann._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>#{targetCh}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Publishing at {new Date(ann.publishAt).toLocaleString()}</div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => handleDeleteScheduledAnnouncement(ann._id)}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button 
                          type="button" 
                          onClick={handleSendChannelMessage} 
                          disabled={publishing} 
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px' }}
                        >
                          <Send size={18} />
                          {publishing ? (isScheduled ? 'Scheduling...' : 'Publishing...') : (isScheduled ? 'Schedule Announcement' : 'Publish Announcement')}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{ 
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky', 
                      top: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview 
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={pubMessage}
                        buttonEnabled={pubButtonEnabled}
                        buttonLabel={pubButtonLabel}
                        buttonUrl={pubButtonUrl}
                        embedEnabled={pubEmbedEnabled}
                        embedTitle={pubEmbedTitle}
                        embedDesc={pubEmbedDesc}
                        embedColor={pubEmbedColor}
                        embedThumb={pubEmbedThumb}
                        embedImage={pubEmbedImage}
                        isDM={false}
                        pingType={pubPingType}
                        pingRoleId={pubPingRoleId}
                        roles={roles}
                        embedAuthorEnabled={pubEmbedAuthorEnabled}
                        embedAuthorName={pubEmbedAuthorName}
                        embedAuthorIcon={pubEmbedAuthorIcon}
                        embedAuthorUrl={pubEmbedAuthorUrl}
                        embedFooterEnabled={pubEmbedFooterEnabled}
                        embedFooterText={pubEmbedFooterText}
                        embedFooterIcon={pubEmbedFooterIcon}
                        embedFields={pubEmbedFields}
                        buttons={pubButtons.length > 0 ? pubButtons : (pubButtonEnabled && pubButtonLabel && pubButtonUrl ? [{ label: pubButtonLabel, url: pubButtonUrl }] : [])}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8.5: YOUTUBE ANNOUNCEMENTS */}
              {activeTab === 'youtube' && settings && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Youtube size={28} style={{ color: '#ff0000' }} />
                    YouTube Announcements
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Automatically post announcement messages to your Discord server when you upload a new YouTube video.
                  </p>

                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>YouTube Upload Notifications</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle the automated YouTube uploader checker system.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.youtube?.enabled || false} 
                          onChange={() => handleToggle('youtube.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.youtube?.enabled && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Channel URL connection row */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            YouTube Channel URL or Handle <span style={{ color: 'var(--danger)' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="text" 
                              value={settings.youtube?.channelUrl || ''} 
                              onChange={(e) => handleInputChange('youtube.channelUrl', e.target.value)}
                              className="glass-input"
                              placeholder="e.g. @timo_xiter or https://youtube.com/channel/UC..."
                            />
                            <button
                              type="button"
                              onClick={handleResolveYoutubeChannel}
                              disabled={resolvingChannel || !settings.youtube?.channelUrl}
                              className="btn-primary"
                              style={{ whiteSpace: 'nowrap', minWidth: '130px', justifyContent: 'center' }}
                            >
                              {resolvingChannel ? 'Connecting...' : 'Connect Channel'}
                            </button>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Enter your YouTube custom handle (with @) or the full channel URL, then click Connect.
                          </span>
                        </div>

                        {/* Resolved Connection Status Banner */}
                        {settings.youtube?.channelId && (
                          <div className="glass-panel" style={{ 
                            padding: '12px 16px', 
                            backgroundColor: 'rgba(37, 99, 235, 0.05)', 
                            borderColor: 'rgba(37, 99, 235, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                              <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>
                                Connected Channel: <strong style={{ color: 'white' }}>{settings.youtube?.channelName || 'YouTube Channel'}</strong>
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              ID: {settings.youtube?.channelId}
                            </span>
                          </div>
                        )}

                        {resolveSuccessMsg && (
                          <div style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>
                            {resolveSuccessMsg}
                          </div>
                        )}

                        {/* Dropdown Configuration fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                          
                          {/* Discord Channel Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              Announcement Discord Channel <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <select 
                              value={settings.youtube?.targetChannelId || ''}
                              onChange={(e) => handleInputChange('youtube.targetChannelId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- Select Discord Channel --</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              The channel where upload announcements will be published.
                            </span>
                          </div>

                          {/* Ping Mention Role Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              Mention Role (Ping)
                            </label>
                            <select 
                              value={settings.youtube?.pingRoleId || ''}
                              onChange={(e) => handleInputChange('youtube.pingRoleId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- None --</option>
                              <option value="everyone">@everyone</option>
                              <option value="here">@here</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id} style={{ color: role.color }}>@{role.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Optional role to mention/ping when announcing new videos.
                            </span>
                          </div>

                        </div>

                        {/* Announcement Message Template */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Video Upload Message Template
                          </label>
                          <textarea 
                            value={settings.youtube?.messageTemplate || ''}
                            onChange={(e) => handleInputChange('youtube.messageTemplate', e.target.value)}
                            className="glass-input"
                            style={{ minHeight: '90px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            placeholder="{url}"
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Available Placeholders: <code>{`{channel}`}</code> (YouTube Channel Name), <code>{`{title}`}</code> (Video Title), <code>{`{url}`}</code> (Video Link).
                          </span>
                        </div>

                        {/* Custom Discord Live Preview */}
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Live Discord Announcement Preview
                          </label>
                          
                          <div style={{
                            backgroundColor: '#313338',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                            color: '#dbdee1',
                            fontSize: '0.9375rem',
                            lineHeight: '1.375rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            width: '100%',
                            maxWidth: '520px'
                          }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <img 
                                src={user?.avatar 
                                  ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
                                  : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                alt="" 
                                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: '600', color: '#f2f3f5', fontSize: '0.95rem' }}>
                                    TIMO X MODE
                                  </span>
                                  <span style={{
                                    backgroundColor: '#5865F2',
                                    color: '#ffffff',
                                    fontSize: '0.625rem',
                                    fontWeight: '700',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    lineHeight: '0.8rem',
                                    height: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}>
                                    BOT
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#949ba4' }}>
                                    Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {/* Ping preview */}
                                  {settings.youtube?.pingRoleId && settings.youtube?.pingRoleId !== 'none' && (
                                    <span style={{ 
                                      backgroundColor: 'rgba(88, 101, 242, 0.3)', 
                                      color: '#c9cdfb', 
                                      padding: '0 4px', 
                                      borderRadius: '3px', 
                                      fontWeight: '500',
                                      marginRight: '6px',
                                      userSelect: 'none'
                                    }}>
                                      {settings.youtube?.pingRoleId === 'everyone' ? '@everyone' : 
                                       settings.youtube?.pingRoleId === 'here' ? '@here' : 
                                       `@${roles.find(r => r.id === settings.youtube?.pingRoleId)?.name || 'Role'}`}
                                    </span>
                                  )}
                                  
                                  {/* Message template preview resolved */}
                                  {(() => {
                                    let resolved = settings.youtube?.messageTemplate || '{url}';
                                    if (!/{url}/i.test(resolved)) {
                                      resolved = resolved.trim() ? `${resolved.trim()}\n{url}` : '{url}';
                                    }
                                    resolved = resolved
                                      .replace(/{channel}/gi, settings.youtube?.channelName || 'Timo Xiter')
                                      .replace(/{title}/gi, 'My Awesome New Video!')
                                      .replace(/{url}/gi, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                                    
                                    // Parse bold markdown tags **text** into HTML preview
                                    const parts = resolved.split(/(\*\*.*?\*\*)/g);
                                    return parts.map((part, index) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={index} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
                                      }
                                      return part;
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: TEMPORARY VOICE CHANNELS */}
              {activeTab === 'tempvoice' && settings && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Temporary Voice Channels</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Automatically create custom temporary voice rooms when members join a designated channel, and delete them when empty.</p>

                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Join-to-Create Voice Channels</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle the automated temporary voice channel creation system.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.tempVoice?.enabled || false} 
                          onChange={() => handleToggle('tempVoice.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {(settings.tempVoice?.enabled) && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Dropdown triggers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                          
                          {/* Join to Create Channel */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Trigger Channel (Join to Create)</label>
                            <select 
                              value={settings.tempVoice?.channelId || ''}
                              onChange={(e) => handleInputChange('tempVoice.channelId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- Select voice channel --</option>
                              {voiceChannels.map(ch => (
                                <option key={ch.id} value={ch.id}>🔊 {ch.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              When members join this channel, the bot will create their private room and move them.
                            </span>
                          </div>

                          {/* Target Category */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Category (Optional)</label>
                            <select 
                              value={settings.tempVoice?.categoryId || ''}
                              onChange={(e) => handleInputChange('tempVoice.categoryId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- Use same category as trigger channel --</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Specify the category where newly generated voice rooms will be grouped.
                            </span>
                          </div>

                        </div>

                        {/* Name Template */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Channel Name Template</label>
                          <input 
                            type="text" 
                            value={settings.tempVoice?.nameTemplate || ''}
                            onChange={(e) => handleInputChange('tempVoice.nameTemplate', e.target.value)}
                            className="glass-input"
                            style={{ maxWidth: '400px' }}
                            placeholder="🔊 {username}'s Room"
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Supports placeholders: Use <code>{`{username}`}</code> to insert the creator's username.
                          </span>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* TAB 8.8: PREMIUM POLLS */}
              {activeTab === 'polls' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Premium Poll Creator</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create interactive polls with Discord button options, live progress embeds, and automated expiration.</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
                    {/* Left Column: Creator Form */}
                    <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                      
                      {/* Target Channel */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Discord Channel <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select 
                          value={pollChannelId}
                          onChange={(e) => setPollChannelId(e.target.value)}
                          className="glass-input"
                        >
                          <option value="">-- Select Discord Channel --</option>
                          {channels.map(ch => (
                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Question */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Poll Question <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                          type="text" 
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          maxLength={256}
                          className="glass-input"
                          placeholder="e.g., What feature should we build next?"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description / Details (Optional)</label>
                        <textarea 
                          rows="3"
                          value={pollDescription}
                          onChange={(e) => setPollDescription(e.target.value)}
                          maxLength={1024}
                          className="glass-input"
                          placeholder="Provide context or explanation for the poll..."
                        />
                      </div>

                      {/* Options Configuration */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Poll Options ({pollOptions.length}/10)</h4>
                          <button 
                            type="button"
                            onClick={() => {
                              if (pollOptions.length < 10) setPollOptions([...pollOptions, '']);
                            }}
                            disabled={pollOptions.length >= 10}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            + Add Option
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {pollOptions.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '24px', fontWeight: '600' }}>#{idx + 1}</span>
                              <input 
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...pollOptions];
                                  updated[idx] = e.target.value;
                                  setPollOptions(updated);
                                }}
                                className="glass-input"
                                placeholder={`Option ${idx + 1}`}
                                maxLength={80}
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (pollOptions.length > 2) {
                                    setPollOptions(pollOptions.filter((_, i) => i !== idx));
                                  } else {
                                    alert('A poll must have at least 2 options.');
                                  }
                                }}
                                className="btn-danger"
                                style={{ padding: '8px 12px', height: '38px', display: 'flex', alignItems: 'center' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advanced Settings Row */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px' }}>Poll Settings</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Allow Multiple Choices</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Voters can select more than one option.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox"
                                checked={pollMultipleChoice}
                                onChange={(e) => setPollMultipleChoice(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Anonymous Voting</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Hide the identity of voters (votes count will still update).</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox"
                                checked={pollAnonymous}
                                onChange={(e) => setPollAnonymous(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Show Live Results</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Allow users to see current vote counts in Discord before ending.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox"
                                checked={pollShowResultsBeforeEnding}
                                onChange={(e) => setPollShowResultsBeforeEnding(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Auto-Expiration Date & Time (Optional)</label>
                            <input 
                              type="datetime-local"
                              value={pollExpiresAt}
                              onChange={(e) => setPollExpiresAt(e.target.value)}
                              className="glass-input"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Embed Customization */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px' }}>Style Customization</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Color</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="color" 
                                  value={pollColor}
                                  onChange={(e) => setPollColor(e.target.value)}
                                  style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                />
                                <input 
                                  type="text" 
                                  value={pollColor}
                                  onChange={(e) => setPollColor(e.target.value)}
                                  className="glass-input" 
                                  placeholder="#2563eb"
                                />
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                              <input 
                                type="text"
                                value={pollThumbnailUrl}
                                onChange={(e) => setPollThumbnailUrl(e.target.value)}
                                className="glass-input"
                                placeholder="https://example.com/thumbnail.png"
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Image URL</label>
                            <input 
                              type="text"
                              value={pollImageUrl}
                              onChange={(e) => setPollImageUrl(e.target.value)}
                              className="glass-input"
                              placeholder="https://example.com/banner.png"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button 
                          type="button" 
                          onClick={handleCreatePoll} 
                          disabled={creatingPoll} 
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px' }}
                        >
                          <Send size={18} />
                          {creatingPoll ? 'Publishing...' : 'Publish Poll'}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{ 
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky', 
                      top: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview 
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={pollDescription}
                        buttonEnabled={false}
                        buttonLabel=""
                        embedEnabled={true}
                        embedTitle={`Poll: ${pollQuestion || 'Enter Question'}`}
                        embedDesc={pollDescription}
                        embedColor={pollColor}
                        embedThumb={pollThumbnailUrl}
                        embedImage={pollImageUrl}
                        isDM={false}
                        buttons={pollOptions.filter(Boolean).map(opt => ({ label: opt }))}
                      />
                    </div>
                  </div>

                  {/* Polls History & Live Stats */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Manage Server Polls</h3>
                    
                    {polls.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', background: '#000000', border: '1px solid #27272a', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No polls found for this server. Create your first poll above or using <code>/poll</code> in Discord!</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {polls.map(poll => {
                          const allVoters = new Set();
                          poll.options.forEach(opt => {
                            if (opt.votes) opt.votes.forEach(v => allVoters.add(v));
                          });
                          const totalVotes = allVoters.size;
                          const isPollActive = poll.status === 'active';

                          return (
                            <div 
                              key={poll._id} 
                              className="glass-panel" 
                              style={{ 
                                padding: '20px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-between',
                                border: '1px solid #27272a', 
                                backgroundColor: '#000000'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px', 
                                    fontWeight: 'bold',
                                    backgroundColor: isPollActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                    color: isPollActive ? 'var(--success)' : 'var(--text-secondary)'
                                  }}>
                                    {isPollActive ? 'ACTIVE' : 'ENDED'}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    {new Date(poll.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{poll.question}</h4>
                                {poll.description && (
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {poll.description}
                                  </p>
                                )}

                                {/* Progress Bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
                                  {poll.options.map((opt, idx) => {
                                    const optVotes = opt.votes ? opt.votes.length : 0;
                                    const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                                    return (
                                      <div key={opt.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                                          <span style={{ color: 'var(--text-secondary)' }}>{opt.text}</span>
                                          <span style={{ fontWeight: '700', color: 'white' }}>{pct}% ({optVotes})</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                          <div style={{ 
                                            width: `${pct}%`, 
                                            height: '100%', 
                                            backgroundColor: isPollActive ? (poll.settings.color || '#2563eb') : '#6b7280', 
                                            transition: 'width 0.3s ease' 
                                          }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  Voters: <strong>{totalVotes}</strong>
                                </span>
                                
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {isPollActive && (
                                    <button 
                                      type="button"
                                      onClick={() => handleEndPoll(poll._id)}
                                      className="btn-secondary"
                                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                    >
                                      End Poll
                                    </button>
                                  )}
                                  <button 
                                    type="button"
                                    onClick={() => handleDeletePoll(poll._id)}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Save Settings Button footer */}
              {activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'broadcast' && activeTab !== 'publish' && activeTab !== 'polls' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="btn-primary pulse-glow"
                    style={{ gap: '10px' }}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              )}


            </form>
            )}
          </main>

        </div>

      {showCropModal && uploadFile && (
        <CropModal 
          file={uploadFile}
          onClose={() => {
            setShowCropModal(false);
            setUploadFile(null);
          }}
          onCrop={async ({ file, cropX, cropY, cropWidth, cropHeight }) => {
            setShowCropModal(false);
            setUploadFile(null);
            setSaving(true);
            setErrorMsg(null);
            try {
              const res = await api.uploadBackground(guildId, file, { cropX, cropY, cropWidth, cropHeight });
              handleInputChange('welcome.background', res.url);
              showNotification('Background uploaded and cropped successfully!');
            } catch (err) {
              console.error(err);
              setErrorMsg(err.message || 'File upload failed.');
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
    </div>
  );
}
