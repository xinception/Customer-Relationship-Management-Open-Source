import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { path: '/contacts', label: 'Contacts', icon: '\u{1F465}' },
  { path: '/campaigns', label: 'Campaigns', icon: '\u{1F4E7}' },
  { path: '/segments', label: 'Segments', icon: '\u{1F3AF}' },
  { path: '/automation', label: 'Automation', icon: '\u26A1' },
  { path: '/analytics', label: 'Analytics', icon: '\u{1F4C8}' },
  { path: '/cdp', label: 'CDP', icon: '\u{1F5C4}\uFE0F' },
  { path: '/ai-insights', label: 'AI Insights', icon: '\u{1F9E0}' },
  { path: '/settings', label: 'Settings', icon: '\u2699\uFE0F' },
];

const styles = {
  sidebar: (collapsed) => ({
    width: collapsed ? '72px' : '250px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    borderRight: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
  }),
  brand: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    gap: '12px',
    minHeight: '64px',
  },
  brandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  brandText: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  navLink: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
    background: isActive ? 'rgba(108,92,231,0.2)' : 'transparent',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    gap: '12px',
    marginBottom: '2px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    borderLeft: isActive ? '3px solid #6c5ce7' : '3px solid transparent',
  }),
  navIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
    flexShrink: 0,
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    padding: '12px 16px',
    fontSize: '18px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    transition: 'color 0.2s',
  },
  profile: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  profileInfo: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  profileName: {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 600,
  },
  profileRole: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
  },
};

const Sidebar = ({ user = { name: 'Admin User', role: 'Administrator' } }) => {
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div style={styles.sidebar(collapsed)}>
      <div style={styles.brand}>
        <div style={styles.brandIcon}>{'\u{1F916}'}</div>
        {!collapsed && <span style={styles.brandText}>AI CRM</span>}
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => styles.navLink(isActive)}
            title={collapsed ? item.label : undefined}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={styles.profile}>
        <div style={styles.avatar}>{initials}</div>
        {!collapsed && (
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{user.name}</div>
            <div style={styles.profileRole}>{user.role}</div>
          </div>
        )}
      </div>

      <button
        style={styles.collapseBtn}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '\u276F' : '\u276E'}
      </button>
    </div>
  );
};

export default Sidebar;
