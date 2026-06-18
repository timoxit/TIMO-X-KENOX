import { useState } from 'react';
import { api } from '../utils/api';
import { Shield, Sparkles, UserCheck, MessageSquare, ArrowRight, FileText, Send, Ticket, Megaphone, Terminal } from 'lucide-react';

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
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
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                gap: '16px',
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                alignItems: 'flex-start',
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
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
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
