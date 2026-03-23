import React from 'react';

const styles = {
  card: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: 0,
  },
  iconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    background: 'rgba(108,92,231,0.15)',
  },
  value: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.1,
  },
  changeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  changeBadge: (type) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '12px',
    fontWeight: 600,
    color: type === 'up' ? '#2ed573' : '#e74c3c',
    background: type === 'up' ? 'rgba(46,213,115,0.1)' : 'rgba(231,76,60,0.1)',
    padding: '3px 8px',
    borderRadius: '20px',
  }),
  changeLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
  },
};

const KPICard = ({ title, value, change, changeType = 'up', icon }) => {
  const arrow = changeType === 'up' ? '\u2191' : '\u2193';

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
      }}
    >
      <div style={styles.topRow}>
        <p style={styles.title}>{title}</p>
        {icon && <div style={styles.iconWrap}>{icon}</div>}
      </div>
      <p style={styles.value}>{value}</p>
      {change !== undefined && (
        <div style={styles.changeRow}>
          <span style={styles.changeBadge(changeType)}>
            {arrow} {Math.abs(change)}%
          </span>
          <span style={styles.changeLabel}>vs last period</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
