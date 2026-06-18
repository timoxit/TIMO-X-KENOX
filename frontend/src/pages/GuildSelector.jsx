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
    <div style={{ minHeight: '100vh', padding: '40px 20px', position: 'relative' }}>
      {/* Background radial highlights */}
      <div style={{
        position: 'absolute',
        top: '0%',
        left: '20%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: -1
      }} />

      {/* Top Header Navigation */}
      <div className="container">
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user.avatar ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                alt={user.username}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
              />
            ) : (
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                color: '#fff'
              }}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>{user.username}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome back to TIMOXITER</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a 
              href="https://discord.gg/ZVfJvw93Ak" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary" 
              style={{ 
                padding: '9px 18px', 
                fontSize: '0.85rem', 
                backgroundColor: '#5865F2', 
                backgroundImage: 'none',
                boxShadow: '0 4px 14px rgba(88, 101, 242, 0.25)',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(88, 101, 242, 0.45)';
                e.currentTarget.style.backgroundColor = '#4752c4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(88, 101, 242, 0.25)';
                e.currentTarget.style.backgroundColor = '#5865F2';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C-3.66,42.5-9.84,76.19,10,95.91a105.73,105.73,0,0,0,32,16.29,80.59,80.59,0,0,0,6.83-11.16A68.61,68.61,0,0,1,38.31,95a55.15,55.15,0,0,0,3.75-2.93,74.9,74.9,0,0,0,67.65,0c1.25.93,2.5,1.92,3.75,2.93a68.46,68.46,0,0,1-10.57,6A81,81,0,0,0,109.73,112.2a105.73,105.73,0,0,0,32-16.29C138,76.19,131.79,42.5,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              Discord Server
            </a>

            <button onClick={onLogout} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
      </div>

      {/* Main Selector Split Layout */}
      <div className="container dashboard-container">
        <div className="selector-layout">
          
          {/* Left Column: Sidebar panel */}
          <aside className="sidebar-panel">
            {/* User Profile */}
            <div className="sidebar-profile">
              {user.avatar ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                    alt={user.username}
                    style={{ width: '76px', height: '76px', borderRadius: '50%', border: '2.5px solid var(--primary)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--success)',
                    border: '3px solid var(--bg-secondary)',
                    borderRadius: '50%'
                  }} />
                </div>
              ) : (
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
                }}>
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: '#fff' }}>{user.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Server Configurator</div>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <div className="sidebar-heading">Search Server</div>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '40px', fontSize: '0.88rem', height: '42px' }}
                />
              </div>
            </div>

            {/* Statistics */}
            <div>
              <div className="sidebar-heading">Your Communities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Total Servers:</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{guilds.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Bot Connected:</span>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>{guilds.filter(g => g.botInGuild).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Not Installed:</span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{guilds.filter(g => !g.botInGuild).length}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="sidebar-heading">Support & Guides</div>
              <div className="sidebar-links">
                <a 
                  href="https://discord.gg/ZVfJvw93Ak" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sidebar-link-btn"
                >
                  <Server size={15} style={{ color: '#5865F2' }} />
                  <span>Join Support Guild</span>
                  <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </a>
                
                <button 
                  onClick={fetchGuilds} 
                  className="sidebar-link-btn"
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <RefreshCw size={15} style={{ color: 'var(--primary)' }} />
                  <span>Refresh Server List</span>
                </button>

                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Please refer to the README.md in the project files for full deployment and bot command documentation.'); }}
                  className="sidebar-link-btn"
                >
                  <HelpCircle size={15} style={{ color: 'var(--warning)' }} />
                  <span>Documentation Guide</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Server list view */}
          <main style={{ minWidth: 0, flex: 1 }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>Select Your Server</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                You must possess Administrator permissions to view and configure these Discord servers.
              </p>
            </div>

            {/* Content Switcher */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  border: '4px solid rgba(99, 102, 241, 0.1)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px auto'
                }} />
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit', fontWeight: '600' }}>Retrieving your Discord Servers...</p>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}} />
              </div>
            ) : error ? (
              <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', borderColor: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>
                <p style={{ color: 'var(--danger)', marginBottom: '20px', fontWeight: '500' }}>{error}</p>
                <button onClick={fetchGuilds} className="btn-primary">Retry fetching</button>
              </div>
            ) : filteredGuilds.length === 0 ? (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No servers found. Ensure you are an Administrator on at least one server matching your search query.</p>
              </div>
            ) : (
              <div className="server-grid">
                {filteredGuilds.map(guild => (
                  <div key={guild.id} className="server-card-horizontal">
                    
                    {/* Left details */}
                    <div className="server-info-group">
                      {guild.icon ? (
                        <img 
                          src={guild.icon} 
                          alt={guild.name} 
                          style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.04)', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }} 
                        />
                      ) : (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: '800',
                          color: 'var(--primary)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
                        }}>
                          {guild.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="server-details-list">
                        <h3 className="server-name-label">{guild.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge-status" style={{
                            backgroundColor: guild.botInGuild ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                            color: guild.botInGuild ? 'var(--success)' : 'var(--secondary)',
                            border: `1px solid ${guild.botInGuild ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`
                          }}>
                            {guild.botInGuild ? 'Connected' : 'Not Connected'}
                          </span>
                          {guild.memberCount !== undefined && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              • {guild.memberCount.toLocaleString()} members
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
                          style={{ padding: '11px 20px', fontSize: '0.88rem', whiteSpace: 'nowrap', gap: '8px', borderRadius: '10px' }}
                        >
                          <Settings size={16} />
                          Configure
                        </button>
                      ) : (
                        <button 
                          onClick={() => window.open(guild.inviteUrl, '_blank')} 
                          className="btn-secondary" 
                          style={{ 
                            padding: '11px 20px', 
                            fontSize: '0.88rem', 
                            whiteSpace: 'nowrap', 
                            gap: '8px', 
                            borderRadius: '10px',
                            borderColor: 'rgba(56, 189, 248, 0.25)', 
                            color: 'var(--secondary)',
                            background: 'rgba(56, 189, 248, 0.04)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.04)';
                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <PlusCircle size={16} />
                          Setup Bot
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
