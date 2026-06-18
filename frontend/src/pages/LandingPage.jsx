import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Shield, Sparkles, UserCheck, MessageSquare, ArrowRight, FileText, Send, Ticket, Megaphone, Terminal } from 'lucide-react';

function BotTerminal({ onAdminLogin }) {
  const [logs, setLogs] = useState([
    { type: 'system', text: 'TIMOXITER BOT OS v1.0.0 Booting...' },
    { type: 'system', text: 'Initializing Gateway connection...' },
    { type: 'success', text: '[OK] Connected to Discord API Gateway' },
    { type: 'success', text: '[OK] Logged in as TIMOXITER#1507' },
    { type: 'info', text: '[INFO] Syncing commands on 14 servers...' },
    { type: 'info', text: '[INFO] Loaded Shield, Welcome & Ticket modules' }
  ]);
  const [commandInput, setCommandInput] = useState('');
  const consoleEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const logTemplates = [
      { type: 'shield', text: '[SHIELD] Scanned message in #general: OK' },
      { type: 'welcome', text: '[WELCOME] Canvas card generated for member' },
      { type: 'ticket', text: '[TICKETS] Active tickets listener polling...' },
      { type: 'info', text: '[STATUS] Latency: 22ms | CPU: 1.2% | RAM: 184MB' },
      { type: 'shield', text: '[SHIELD] Link filter scanned URL: Safe' },
      { type: 'moderation', text: '[MODERATION] Auto-archived ticket channel' },
      { type: 'gateway', text: '[GATEWAY] Discord heartbeat acknowledged' }
    ];

    const interval = setInterval(() => {
      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [
        ...prev.slice(-9), // keep last 10 logs
        { type: randomTemplate.type, text: `[${timestamp}] ${randomTemplate.text}` }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
    }
  }, [logs]);

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setLogs(prev => [
      ...prev,
      { type: 'input', text: `$ ${cmd}` }
    ]);
    setCommandInput('');

    const cmdLower = cmd.toLowerCase();
    if (cmdLower === 'admin login') {
      setLogs(prev => [
        ...prev,
        { type: 'success', text: 'Opening Admin Portal...' }
      ]);
      setTimeout(() => {
        if (onAdminLogin) onAdminLogin();
      }, 500);
    } else if (cmdLower === 'help') {
      setLogs(prev => [
        ...prev,
        { type: 'system', text: 'Available commands:' },
        { type: 'info', text: '  status      - Display bot system metrics and host info' },
        { type: 'info', text: '  ping        - Test connection latency' },
        { type: 'info', text: '  clear       - Clear terminal console logs' }
      ]);
    } else if (cmdLower === 'status') {
      setLogs(prev => [
        ...prev,
        { type: 'info', text: '--- System Metrics ---' },
        { type: 'success', text: 'Gateway Status: Connected' },
        { type: 'info', text: `Ping: ${Math.floor(Math.random() * 15) + 10}ms` },
        { type: 'info', text: 'CPU Usage: 1.2%' },
        { type: 'info', text: 'RAM Usage: 184.2 MB' },
        { type: 'system', text: 'Uptime: 4 days, 12 hours, 3 minutes' }
      ]);
    } else if (cmdLower === 'ping') {
      setLogs(prev => [
        ...prev,
        { type: 'success', text: `Pong! Latency: ${Math.floor(Math.random() * 15) + 10}ms` }
      ]);
    } else if (cmdLower === 'clear') {
      setLogs([]);
    } else {
      setLogs(prev => [
        ...prev,
        { type: 'moderation', text: `Command not found: ${cmd}. Type "help" for a list of available commands.` }
      ]);
    }
  };

  return (
    <div className="glass-panel" style={{
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: '0.85rem',
      backgroundColor: 'rgba(3, 7, 18, 0.95)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
      textAlign: 'left'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 18px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600' }}>
          <Terminal size={12} style={{ color: 'var(--primary)' }} />
          <span>timoxiter-core-bot:~</span>
        </div>
        <div style={{ width: '40px' }} />
      </div>
      {/* Terminal logs list */}
      <div 
        ref={consoleEndRef}
        onClick={handleTerminalClick}
        style={{
          padding: '20px',
          height: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          lineHeight: '1.4',
          cursor: 'text'
        }}
      >
        {logs.map((log, index) => {
          let color = '#e2e8f0';
          if (log.type === 'success') color = 'var(--success)';
          if (log.type === 'shield') color = 'var(--secondary)';
          if (log.type === 'welcome') color = 'var(--accent)';
          if (log.type === 'ticket') color = '#fbbf24'; // gold
          if (log.type === 'system') color = '#60a5fa'; // light blue
          if (log.type === 'moderation') color = 'var(--danger)';
          if (log.type === 'input') color = '#ffffff';
          return (
            <div key={index} style={{ color, wordBreak: 'break-all' }}>
              {log.text}
            </div>
          );
        })}
        {/* Command Input Form */}
        <form onSubmit={handleCommandSubmit} style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', marginTop: '6px' }}>
          <span style={{ color: 'var(--primary)', marginRight: '8px', fontWeight: 'bold' }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            style={{
              flexGrow: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              fontSize: '0.85rem',
              padding: 0
            }}
            placeholder="Type 'help'..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

export default function LandingPage({ onAdminLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await api.getDiscordAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError('Failed to contact the backend server. Make sure it is running.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 24px',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div className="container" style={{
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: -1
        }} />

        <div className="hero-layout">
          {/* Left Column: Title & CTA */}
          <div className="hero-left">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '99px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}>
              <span>⚡ NEXT-GEN DISCORD CONTROL PANEL</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(3.5rem, 6vw, 5rem)',
              fontWeight: '900',
              fontFamily: 'Outfit',
              background: 'linear-gradient(135deg, #ffffff 10%, #c7d2fe 50%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.05',
              marginBottom: '16px'
            }}>
              TIMOXITER
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '640px',
              marginBottom: '32px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Empower your Discord community with instant spam deletion, custom welcome canvas layouts, automatic roles, and secure button verification—all managed from a premium real-time control dashboard.
            </p>

            {error && (
              <div className="glass-panel" style={{
                padding: '14px 20px',
                borderColor: 'var(--danger)',
                backgroundColor: 'rgba(244, 63, 94, 0.03)',
                color: 'var(--danger)',
                width: '100%',
                marginBottom: '20px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                borderLeft: '4px solid var(--danger)'
              }}>
                {error}
              </div>
            )}

            <div className="hero-buttons-container">
              <button 
                onClick={handleLogin} 
                disabled={loading}
                className="btn-primary pulse-glow" 
                style={{ fontSize: '1rem', padding: '14px 32px', borderRadius: '12px', gap: '10px' }}
              >
                {loading ? 'Connecting...' : 'Connect Discord Account'}
                <ArrowRight size={18} />
              </button>

              <a 
                href="https://discord.gg/ZVfJvw93Ak" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary" 
                style={{ 
                  fontSize: '1rem', 
                  padding: '14px 32px', 
                  borderRadius: '12px', 
                  gap: '10px',
                  textDecoration: 'none',
                  borderColor: 'rgba(88, 101, 242, 0.25)',
                  color: 'white',
                  background: 'rgba(88, 101, 242, 0.06)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(88, 101, 242, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(88, 101, 242, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C-3.66,42.5-9.84,76.19,10,95.91a105.73,105.73,0,0,0,32,16.29,80.59,80.59,0,0,0,6.83-11.16A68.61,68.61,0,0,1,38.31,95a55.15,55.15,0,0,0,3.75-2.93,74.9,74.9,0,0,0,67.65,0c1.25.93,2.5,1.92,3.75,2.93a68.46,68.46,0,0,1-10.57,6A81,81,0,0,0,109.73,112.2a105.73,105.73,0,0,0,32-16.29C138,76.19,131.79,42.5,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
                Join Support Server
              </a>
            </div>
          </div>

          {/* Right Column: Live Bot Status Console */}
          <div className="hero-right">
            <BotTerminal onAdminLogin={onAdminLogin} />
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          paddingTop: '64px',
          marginTop: '32px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '40px',
            background: 'linear-gradient(to right, #ffffff, var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            Engineered with Powerful Capabilities
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            width: '100%',
            textAlign: 'left'
          }}>
            {[
              {
                icon: <Shield size={20} />,
                bg: 'rgba(244, 63, 94, 0.05)',
                color: 'var(--danger)',
                title: 'Shield Protection',
                desc: 'Instant auto-delete for blacklisted links and rapid message spam detection with auto-timeout.'
              },
              {
                icon: <Sparkles size={20} />,
                bg: 'rgba(99, 102, 241, 0.05)',
                color: 'var(--primary)',
                title: 'Canvas Welcome',
                desc: 'Create dynamic, visually stunning welcome cards with custom backgrounds, avatar frames, text, and colors.'
              },
              {
                icon: <UserCheck size={20} />,
                bg: 'rgba(56, 189, 248, 0.05)',
                color: 'var(--secondary)',
                title: 'Verification',
                desc: 'Verify new members using secure interactive Discord buttons to unlock roles and visibility.'
              },
              {
                icon: <MessageSquare size={20} />,
                bg: 'rgba(168, 85, 247, 0.05)',
                color: 'var(--accent)',
                title: 'Auto Nicknames',
                desc: 'Enforce server nickname formats and automatic role mappings when members join.'
              },
              {
                icon: <FileText size={20} />,
                bg: 'rgba(16, 185, 129, 0.05)',
                color: 'var(--success)',
                title: 'Server Logs',
                desc: 'Track all administrative actions, bans, warns, kicks, timeouts, and channel changes in a live dashboard feed.'
              },
              {
                icon: <Send size={20} />,
                bg: 'rgba(59, 130, 246, 0.05)',
                color: '#3b82f6',
                title: 'Mass DM Broadcast',
                desc: 'Instantly broadcast highly styled messages, custom buttons, and embeds to all server members.'
              },
              {
                icon: <Ticket size={20} />,
                bg: 'rgba(99, 102, 241, 0.05)',
                color: 'var(--primary)',
                title: 'Ticket System',
                desc: 'Allow members to open private, secure support channels to communicate directly with server staff.'
              },
              {
                icon: <Megaphone size={20} />,
                bg: 'rgba(245, 158, 11, 0.05)',
                color: 'var(--warning)',
                title: 'Announcements',
                desc: 'Broadcast styled embeds, message contents, media attachments, and button links to channels.'
              }
            ].map((feat, index) => (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderRadius: '16px' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feat.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), 0 0 15px ${feat.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: feat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feat.color,
                  border: `1px solid rgba(255,255,255,0.03)`
                }}>
                  {feat.icon}
                </div>
                <div>
                  <h3 style={{ marginBottom: '6px', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
