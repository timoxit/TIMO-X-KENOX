import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  LogOut, Search, Settings, Users, Server, Calendar, UserCheck, 
  RefreshCw, ExternalLink, Link, Check, ShieldAlert
} from 'lucide-react';

export default function AdminSelector({ user, onSelectGuild, onLogout }) {
  const [guilds, setGuilds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedGuildId, setCopiedGuildId] = useState(null);

  // States for authorized users list
  const [activeTab, setActiveTab] = useState('servers'); // 'servers' or 'users'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const handleCopyInvite = (guildId, inviteUrl) => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedGuildId(guildId);
    setTimeout(() => {
      setCopiedGuildId(null);
    }, 2000);
  };

  const handleLeaveGuild = async (guildId, guildName) => {
    if (!window.confirm(`Are you absolutely sure you want the bot to leave "${guildName}"? This action cannot be undone and the bot must be re-invited by an administrator.`)) {
      return;
    }
    
    try {
      await api.leaveGuild(guildId);
      setGuilds(prev => prev.filter(g => g.id !== guildId));
      alert(`Successfully left ${guildName}.`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to leave guild.');
    }
  };

  const fetchAdminGuilds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGuilds();
      setGuilds(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load server data. Ensure the bot is running and backend is online.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizedUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await api.getAuthorizedUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setUsersError('Failed to load authorized users. Ensure backend is online.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminGuilds();
    fetchAuthorizedUsers();
  }, []);

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.customNickname && u.customNickname.toLowerCase().includes(search.toLowerCase())) ||
    u.discordId.includes(search)
  );

  // Compute aggregate statistics
  const totalServers = guilds.length;
  const totalMembers = guilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      
      {/* Centered Header Bar */}
      <div className="container">
        <header className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)'
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{user.username}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  SYSTEM OWNER
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Global Administration Panel</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a 
              href="https://discord.gg/ZVfJvw93Ak" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary" 
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.85rem', 
                backgroundColor: '#5865F2', 
                backgroundImage: 'none',
                boxShadow: '0 4px 10px rgba(88, 101, 242, 0.2)',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(88, 101, 242, 0.35)';
                e.currentTarget.style.backgroundColor = '#4752c4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(88, 101, 242, 0.2)';
                e.currentTarget.style.backgroundColor = '#5865F2';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C-3.66,42.5-9.84,76.19,10,95.91a105.73,105.73,0,0,0,32,16.29,80.59,80.59,0,0,0,6.83-11.16A68.61,68.61,0,0,1,38.31,95a55.15,55.15,0,0,0,3.75-2.93,74.9,74.9,0,0,0,67.65,0c1.25.93,2.5,1.92,3.75,2.93a68.46,68.46,0,0,1-10.57,6A81,81,0,0,0,109.73,112.2a105.73,105.73,0,0,0,32-16.29C138,76.19,131.79,42.5,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              Discord Server
            </a>

            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
      </div>

      {/* Centered Dashboard Layout */}
      <div className="container dashboard-container">
        {/* Dashboard 2-Column Split Layout */}
        <div className="selector-layout">
          
          {/* Left Column: Sidebar panel */}
          <aside className="glass-panel sidebar-panel">
            
            {/* Sidebar Heading / Portal Title */}
            <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              margin: '0 auto 12px auto',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
                <Server size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Admin Dashboard</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Settings Overview</span>
            </div>

            {/* Sidebar Search */}
            <div>
              <div className="sidebar-heading" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Listing</div>
              <div style={{ position: 'relative', width: '100%', marginTop: '6px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder={activeTab === 'servers' ? "Filter servers..." : "Filter users..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem', height: '40px' }}
                />
              </div>
            </div>

            {/* Sidebar Statistics */}
            <div>
              <div className="sidebar-heading" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Stats</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Guilds</span>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{loading ? '...' : totalServers}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Member Reach</span>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{loading ? '...' : totalMembers.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Authorized Users</span>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{usersLoading ? '...' : users.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="sidebar-heading" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</div>
              <div className="sidebar-links" style={{ marginTop: '8px' }}>
                <button 
                  onClick={() => { fetchAdminGuilds(); fetchAuthorizedUsers(); }} 
                  className="sidebar-link-btn"
                  style={{ width: '100%', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)', cursor: 'pointer' }}
                >
                  <RefreshCw size={15} style={{ color: 'var(--primary)' }} />
                  <span>Refresh Server & Users</span>
                </button>
                
                <a 
                  href="https://discord.gg/ZVfJvw93Ak" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sidebar-link-btn"
                >
                  <Server size={15} style={{ color: '#5865F2' }} />
                  <span>Support Discord</span>
                  <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </a>
              </div>
            </div>

          </aside>

          {/* Right Column: Main view */}
          <main style={{ minWidth: 0, flex: 1 }}>
            
            {/* Tab switch buttons */}
            <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '6px', marginBottom: '20px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('servers'); setSearch(''); }}
                className={activeTab === 'servers' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '12px', justifyContent: 'center', borderRadius: '8px', gap: '8px' }}
              >
                <Server size={18} />
                Managed Servers
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('users'); setSearch(''); }}
                className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '12px', justifyContent: 'center', borderRadius: '8px', gap: '8px' }}
              >
                <Users size={18} />
                Authorized Users ({users.length})
              </button>
            </div>

            {activeTab === 'servers' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', textAlign: 'left' }}>All Server Listings</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px', textAlign: 'left' }}>
                      Displaying all servers where the TIMOXITER bot has been added globally.
                    </p>
                  </div>
                </div>

                {/* Servers List */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid rgba(99, 102, 241, 0.2)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px auto'
                    }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Fetching global server listings...</p>
                  </div>
                ) : error ? (
                  <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--danger)' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
                    <button onClick={fetchAdminGuilds} className="btn-primary">Retry</button>
                  </div>
                ) : filteredGuilds.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No connected servers found matching your query.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {filteredGuilds.map(guild => (
                      <div key={guild.id} className="glass-panel server-card-horizontal" style={{ padding: '16px 24px', flexWrap: 'nowrap' }}>
                        
                        {/* Left section: Guild Icon & Name Details */}
                        <div className="server-info-group" style={{ flex: '1 1 35%' }}>
                          {guild.icon ? (
                            <img 
                              src={guild.icon} 
                              alt={guild.name} 
                              style={{ width: '52px', height: '52px', borderRadius: '50%', border: '1px solid var(--border-color)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} 
                            />
                          ) : (
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontWeight: 'bold'
                            }}>
                              {guild.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
                            </div>
                          )}
                          
                          <div style={{ minWidth: 0, textAlign: 'left' }}>
                            <h3 className="server-name-label" style={{ marginBottom: '2px', fontSize: '1.1rem' }}>
                              {guild.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              <Users size={12} style={{ color: 'var(--secondary)' }} />
                              <span>{guild.memberCount || 0} Members</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle section: Metadata Details */}
                        <div className="admin-server-metadata" style={{
                          display: 'flex',
                          flex: '1 1 40%',
                          gap: '24px',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <Calendar size={12} />
                              JOINED DATE
                            </span>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                              {formatDate(guild.joinedAt)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <UserCheck size={12} />
                              OWNER ID
                            </span>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                              {guild.ownerId || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Right section: Action buttons */}
                        <div className="server-actions-group" style={{ display: 'flex', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
                          {guild.inviteUrl ? (
                            <button 
                              type="button"
                              onClick={() => handleCopyInvite(guild.id, guild.inviteUrl)} 
                              className="btn-secondary" 
                              style={{ 
                                padding: '10px 18px', 
                                fontSize: '0.88rem', 
                                gap: '6px', 
                                whiteSpace: 'nowrap', 
                                backgroundColor: copiedGuildId === guild.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: copiedGuildId === guild.id ? 'var(--success)' : 'var(--border-color)',
                                color: copiedGuildId === guild.id ? 'var(--success)' : 'white'
                              }}
                            >
                              {copiedGuildId === guild.id ? (
                                <>
                                  <Check size={15} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Link size={15} />
                                  Copy Invite
                                </>
                              )}
                            </button>
                          ) : (
                            <button 
                              type="button"
                              disabled
                              className="btn-secondary" 
                              style={{ 
                                padding: '10px 18px', 
                                fontSize: '0.88rem', 
                                gap: '6px', 
                                whiteSpace: 'nowrap', 
                                opacity: 0.4,
                                cursor: 'not-allowed'
                              }}
                              title="Invite link unavailable. Bot lacks 'Create Instant Invite' permission."
                            >
                              <Link size={15} />
                              No Invite
                            </button>
                          )}

                          <button 
                            type="button"
                            onClick={() => handleLeaveGuild(guild.id, guild.name)} 
                            className="btn-secondary" 
                            style={{ 
                              padding: '10px 18px', 
                              fontSize: '0.88rem', 
                              gap: '6px', 
                              whiteSpace: 'nowrap', 
                              borderColor: 'rgba(244, 63, 94, 0.3)',
                              color: 'var(--danger)',
                              backgroundColor: 'rgba(244, 63, 94, 0.03)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
                              e.currentTarget.style.borderColor = 'var(--danger)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.03)';
                              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                            }}
                          >
                            <LogOut size={15} />
                            Leave Server
                          </button>

                          <button 
                            type="button"
                            onClick={() => onSelectGuild(guild.id, guild.name, guild.icon)} 
                            className="btn-primary" 
                            style={{ padding: '10px 18px', fontSize: '0.88rem', gap: '6px', whiteSpace: 'nowrap' }}
                          >
                            <Settings size={15} />
                            Configure
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Users Tab View */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', textAlign: 'left' }}>Authorized Users</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px', textAlign: 'left' }}>
                      List of users who have authorized the bot via Discord OAuth2.
                    </p>
                  </div>
                </div>

                {usersLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid rgba(99, 102, 241, 0.2)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px auto'
                    }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Fetching authorized users...</p>
                  </div>
                ) : usersError ? (
                  <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--danger)' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{usersError}</p>
                    <button onClick={fetchAuthorizedUsers} className="btn-primary">Retry</button>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No authorized users found matching your query.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px', width: '100%' }}>
                    {filteredUsers.map(u => (
                      <div key={u.discordId} className="glass-panel" style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        borderRadius: '16px',
                        textAlign: 'left'
                      }}>
                        {/* Card Top / Identity */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          {u.avatar ? (
                            <img 
                              src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`} 
                              alt={u.username} 
                              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.05)' }} 
                            />
                          ) : (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '1.1rem'
                            }}>
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', fontSize: '1rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.customNickname || u.username}
                              </span>
                              {u.customNickname && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  ({u.username})
                                </span>
                              )}
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                              ID: {u.discordId}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {u.isAdmin ? (
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                  color: 'var(--warning)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(251, 191, 36, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <ShieldAlert size={10} />
                                  SYSTEM ADMIN
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                  color: 'var(--primary)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(99, 102, 241, 0.3)'
                                }}>
                                  AUTHORIZED USER
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Body / Custom Details */}
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          minHeight: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          {u.customBio ? (
                            <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineClamp: 2 }}>
                              {u.customBio}
                            </p>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              No biography or status details configured.
                            </p>
                          )}
                        </div>

                        {/* Card Footer / Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Auth: {formatDate(u.authorizedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

      </div>



      {/* Hide metadata details & customize scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .admin-server-metadata {
            display: none !important;
          }
          .server-card-horizontal {
            flex-wrap: wrap !important;
          }
          .server-info-group {
            flex: 1 1 100% !important;
            margin-bottom: 12px;
          }
          .server-actions-group {
            width: 100% !important;
            margin-left: 0 !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .server-actions-group button {
            flex: 1 1 calc(50% - 10px) !important;
            min-width: 120px !important;
            justify-content: center !important;
          }
        }
      `}} />
    </div>
  );
}
