import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { LogOut, Search, PlusCircle, Settings, RefreshCw, Server } from 'lucide-react';

export default function GuildSelector({ user, onSelectGuild, onLogout }) {
  const [guilds, setGuilds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuilds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGuilds();
      setGuilds(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch servers. Please make sure the bot is running and your token is valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      
      {/* Horizontal Dashboard Header */}
      <div className="container" style={{ maxWidth: '1200px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 28px',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          gap: '20px'
        }}>
          {/* User Profile Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.avatar ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                alt={user.username}
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #27272a' }}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                color: '#fff',
                fontSize: '0.85rem'
              }}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{user.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Welcome to TIMOXITER</div>
            </div>
          </div>

          {/* Inline Stats Chips */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ padding: '6px 14px', background: '#000000', border: '1px solid #27272a', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Total: <strong style={{ color: '#fff' }}>{guilds.length}</strong>
            </div>
            <div style={{ padding: '6px 14px', background: '#000000', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent)' }}>
              Connected: <strong>{guilds.filter(g => g.botInGuild).length}</strong>
            </div>
            <div style={{ padding: '6px 14px', background: '#000000', border: '1px solid #27272a', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Offline: <strong>{guilds.filter(g => !g.botInGuild).length}</strong>
            </div>
          </div>

          {/* Quick Actions / Controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search inputs */}
            <div style={{ position: 'relative', width: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '34px', borderRadius: '6px' }}
              />
            </div>

            <button 
              onClick={fetchGuilds} 
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '6px', height: '34px' }}
              title="Sync Server List"
            >
              <RefreshCw size={13} />
            </button>

            <a 
              href="https://discord.gg/ZVfJvw93Ak" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary" 
              style={{ 
                padding: '8px 14px', 
                fontSize: '0.8rem', 
                borderRadius: '6px',
                textDecoration: 'none',
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Support
            </a>

            <button 
              onClick={onLogout} 
              className="btn-secondary" 
              style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', height: '34px' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="container" style={{ maxWidth: '1200px', textAlign: 'center' }}>
        
        {/* Title & Description */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Select Your Server</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0 auto' }}>
            Choose a guild below to configure bot features. You must possess administrative credentials in the selected Discord server.
          </p>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ padding: '80px 0' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #27272a',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading Discord guilds...</p>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}} />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '30px', maxWidth: '500px', margin: '0 auto', borderColor: 'var(--danger)', borderRadius: '6px' }}>
            <p style={{ color: 'var(--danger)', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</p>
            <button onClick={fetchGuilds} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Sync Servers</button>
          </div>
        ) : filteredGuilds.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto', borderRadius: '6px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No servers found. Confirm you are an Administrator on at least one server matching your query.</p>
          </div>
        ) : (
          /* Centers the Grid on the screen */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
            width: '100%',
            justifyContent: 'center'
          }}>
            {filteredGuilds.map(guild => (
              <div 
                key={guild.id} 
                className="glass-panel" 
                style={{ 
                  background: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '8px', 
                  padding: '30px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                  minHeight: '260px'
                }}
              >
                {/* Top Details (Icon + Name) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                  {guild.icon ? (
                    <img 
                      src={guild.icon} 
                      alt={guild.name} 
                      style={{ 
                        width: '68px', 
                        height: '68px', 
                        borderRadius: '50%', 
                        border: '1px solid #27272a',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      {guild.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
                    </div>
                  )}
                  
                  <div style={{ width: '100%' }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700', 
                      color: '#fff', 
                      letterSpacing: '-0.02em',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={guild.name}>
                      {guild.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                      <span className="badge-status" style={{
                        backgroundColor: guild.botInGuild ? 'rgba(16, 185, 129, 0.05)' : '#18181b',
                        color: guild.botInGuild ? 'var(--accent)' : 'var(--text-muted)',
                        border: `1px solid ${guild.botInGuild ? 'rgba(16, 185, 129, 0.15)' : '#27272a'}`,
                        fontSize: '0.68rem',
                        padding: '1px 6px'
                      }}>
                        {guild.botInGuild ? 'Active' : 'Offline'}
                      </span>
                      {guild.memberCount !== undefined && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {guild.memberCount.toLocaleString()} members
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div style={{ width: '100%', marginTop: '24px' }}>
                  {guild.botInGuild ? (
                    <button 
                      onClick={() => onSelectGuild(guild.id, guild.name, guild.icon)} 
                      className="btn-primary" 
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        fontSize: '0.8rem', 
                        padding: '10px', 
                        borderRadius: '6px' 
                      }}
                    >
                      <Settings size={14} />
                      Configure Guild
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.open(guild.inviteUrl, '_blank')} 
                      className="btn-secondary" 
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        fontSize: '0.8rem', 
                        padding: '10px', 
                        borderRadius: '6px',
                        borderColor: '#27272a',
                        background: '#000000',
                        color: 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#18181b';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <PlusCircle size={14} />
                      Invite Bot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
