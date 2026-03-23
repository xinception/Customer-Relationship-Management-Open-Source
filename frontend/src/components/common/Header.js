import React, { useState, useRef, useEffect } from 'react';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '64px',
    background: '#1a1a2e',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 900,
  },
  title: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 14px 8px 36px',
    color: '#ffffff',
    fontSize: '13px',
    width: '260px',
    outline: 'none',
    transition: 'border-color 0.2s, width 0.3s',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    pointerEvents: 'none',
  },
  notifBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: 'rgba(255,255,255,0.6)',
    padding: '4px',
    transition: 'color 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-4px',
    background: '#e74c3c',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #1a1a2e',
  },
  avatarBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
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
  },
  dropdown: {
    position: 'absolute',
    top: '44px',
    right: 0,
    background: '#1e1e36',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    minWidth: '180px',
    padding: '8px 0',
    zIndex: 1100,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '4px 0',
  },
};

const Header = ({
  title = 'Dashboard',
  notificationCount = 0,
  user = { name: 'Admin User' },
  onSearch,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.right}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>{'\u{1F50D}'}</span>
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchInput}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#6c5ce7';
              e.target.style.width = '320px';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.width = '260px';
            }}
          />
        </div>

        <button
          style={styles.notifBtn}
          title="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          {'\u{1F514}'}
          {notificationCount > 0 && (
            <span style={styles.badge}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            style={styles.avatarBtn}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div style={styles.avatar}>{initials}</div>
          </button>
          {dropdownOpen && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                {'\u{1F464}'} Profile
              </button>
              <button
                style={styles.dropdownItem}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                {'\u2699\uFE0F'} Settings
              </button>
              <div style={styles.dropdownDivider} />
              <button
                style={styles.dropdownItem}
                onClick={onLogout}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(231,76,60,0.1)';
                  e.target.style.color = '#e74c3c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                {'\u{1F6AA}'} Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
