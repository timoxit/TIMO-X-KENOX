import { useState } from 'react';
import { api } from '../utils/api';
import { Shield, Sparkles, UserCheck, MessageSquare, ArrowRight, FileText, Send, Ticket, Megaphone, Terminal, Server, Volume2 } from 'lucide-react';

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
      padding: '40px 24px',
      boxSizing: 'border-box'
    }}>
      {/* Centered Gateway Card */}
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '8px',
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Status indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '99px',
          padding: '4px 10px',
          fontSize: '0.72rem',
          fontWeight: '700',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '24px'
        }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />
          <span>Gateway Active</span>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          fontFamily: 'Outfit',
          letterSpacing: '-0.04em',
          lineHeight: '1',
          marginBottom: '10px',
          color: '#ffffff'
        }}>
          TIMOXITER
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          Manage your Discord guild shield, custom welcome canvas layouts, automatic member validation, and logs in a centralized administrative portal.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            border: '1px solid var(--danger)',
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            color: 'var(--danger)',
            borderRadius: '6px',
            fontSize: '0.825rem',
            textAlign: 'left',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.95rem',
            padding: '14px',
            borderRadius: '6px'
          }}
        >
          {loading ? 'Connecting Account...' : 'Continue with Discord'}
          <ArrowRight size={16} />
        </button>

        {/* Admin portal trigger */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
          <button
            onClick={onAdminLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            System Owner Portal
          </button>
        </div>
      </div>

      {/* Sleek Monochromatic Capabilities Matrix */}
      <div className="container" style={{ maxWidth: '960px', marginTop: '64px', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px'
        }}>
          {[
            {
              icon: <Shield size={18} />,
              title: 'Shield Mod Guard',
              desc: 'Spam filters and link blacklisting with auto timeout.'
            },
            {
              icon: <Sparkles size={18} />,
              title: 'Canvas Welcome',
              desc: 'Dynamic join banners with customized background layouts.'
            },
            {
              icon: <UserCheck size={18} />,
              title: 'Button Validation',
              desc: 'Discord interactive button roles to verify members.'
            },
            {
              icon: <Ticket size={18} />,
              title: 'Ticket System',
              desc: 'Setup support tickets, message templates, and helper roles.'
            },
            {
              icon: <MessageSquare size={18} />,
              title: 'Roles & Nicknames',
              desc: 'Auto-assign roles and structure formatting when members join.'
            },
            {
              icon: <FileText size={18} />,
              title: 'Server Logs',
              desc: 'Track moderation actions and configurations in real-time.'
            },
            {
              icon: <Send size={18} />,
              title: 'Broadcast DMs',
              desc: 'Send bulk direct messages, embeds, and buttons to all members.'
            },
            {
              icon: <Megaphone size={18} />,
              title: 'Publish Announcement',
              desc: 'Dispatch formatted rich webhook messages with buttons and pings.'
            },
            {
              icon: <Youtube size={18} />,
              title: 'YouTube Announcements',
              desc: 'Automatically post alerts when a YouTube channel uploads a video.'
            },
            {
              icon: <Volume2 size={18} />,
              title: 'Temp Voice Channels',
              desc: 'Dynamic join-to-create voice rooms that auto-delete when empty.'
            },
            {
              icon: <Server size={18} />,
              title: 'System Owner Portal',
              desc: 'Administrative portal for full server details and member actions.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                display: 'flex',
                gap: '16px',
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                alignItems: 'center',
                textAlign: 'left'
              }}
            >
              <div style={{
                color: 'var(--primary)',
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <h3 style={{ fontSize: '0.925rem', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
                  {item.title}
                </h3>
                <span style={{ color: 'var(--border-color)', userSelect: 'none', fontSize: '0.9rem' }}>|</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
