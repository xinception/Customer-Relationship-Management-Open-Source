import React from 'react';

const styles = {
  card: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px 0 24px',
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  body: {
    padding: '18px 24px 24px 24px',
  },
};

const Card = ({ title, subtitle, children, className, actions, style: customStyle }) => {
  return (
    <div
      className={className}
      style={{ ...styles.card, ...customStyle }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
      }}
    >
      {(title || actions) && (
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            {title && <h3 style={styles.title}>{title}</h3>}
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div style={styles.actions}>{actions}</div>}
        </div>
      )}
      <div style={styles.body}>{children}</div>
    </div>
  );
};

export default Card;
