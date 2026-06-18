import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { LogOut, Search, PlusCircle, Settings, Server, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      
      {/* Top Header Bar */}
      <div className="container" style={{ maxWidth: '1200px' }}>
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          marginBottom: '32px',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.avatar ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                alt={user.username}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #27272a' }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href="https://discord.gg/ZVfJvw93Ak" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary" 
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.8rem', 
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              Support Server
            </a>

            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>
      </div>

      {/* Main Grid Layout */}
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="selector-layout" style={{ gap: '32px' }}>
          
          {/* Left Column: Sidebar panel */}
          <aside className="sidebar-panel" style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '20px' }}>
            {/* Search Input */}
            <div>
              <div className="sidebar-heading">Search Server</div>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter servers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '36px', fontSize: '0.85rem', height: '38px', borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Statistics */}
            <div style={{ marginTop: '4px' }}>
              <div className="sidebar-heading">System Reach</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Managed:</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{guilds.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Online:</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{guilds.filter(g => g.botInGuild).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Offline:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{guilds.filter(g => !g.botInGuild).length}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: '4px' }}>
              <div className="sidebar-heading">Quick Actions</div>
              <div className="sidebar-links">
                <button 
                  onClick={fetchGuilds} 
                  className="sidebar-link-btn"
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }}
                >
                  <RefreshCw size={13} style={{ color: 'var(--primary)' }} />
                  <span>Sync Server List</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Server list view */}
          <main style={{ minWidth: 0, flex: 1 }}>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em' }}>Select Your Server</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                Select a connected guild below. You must possess administrative credentials to configure the bot modules.
              </p>
            </div>

            {/* Content Switcher */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #27272a',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fetching guilds...</p>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}} />
              </div>
            ) : error ? (
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--danger)', borderRadius: '6px' }}>
                <p style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '500' }}>{error}</p>
                <button onClick={fetchGuilds} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Retry Sync</button>
              </div>
            ) : filteredGuilds.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '6px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No servers found. Confirm you have administrative rights in your guilds.</p>
              </div>
            ) : (
              <div className="server-grid" style={{ gap: '12px' }}>
                {filteredGuilds.map(guild => (
                  <div key={guild.id} className="server-card-horizontal" style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '16px 20px' }}>
                    
                    {/* Left details */}
                    <div className="server-info-group" style={{ gap: '16px' }}>
                      {guild.icon ? (
                        <img 
                          src={guild.icon} 
                          alt={guild.name} 
                          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #27272a' }} 
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: '800',
                          color: '#fff'
                        }}>
                          {guild.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="server-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <h3 className="server-name-label" style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: 0 }}>{guild.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge-status" style={{
                            backgroundColor: guild.botInGuild ? 'rgba(16, 185, 129, 0.06)' : '#18181b',
                            color: guild.botInGuild ? 'var(--accent)' : 'var(--text-muted)',
                            border: `1px solid ${guild.botInGuild ? 'rgba(16, 185, 129, 0.15)' : '#27272a'}`
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

                    {/* Right actions */}
                    <div style={{ flexShrink: 0 }}>
                      {guild.botInGuild ? (
                        <button 
                          onClick={() => onSelectGuild(guild.id, guild.name, guild.icon)} 
                          className="btn-primary" 
                          style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px' }}
                        >
                          <Settings size={14} />
                          Configure
                        </button>
                      ) : (
                        <button 
                          onClick={() => window.open(guild.inviteUrl, '_blank')} 
                          className="btn-secondary" 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '0.8rem', 
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
                          Invite Bot
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
