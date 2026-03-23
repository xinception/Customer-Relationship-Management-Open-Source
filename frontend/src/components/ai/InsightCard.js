import React from 'react';

const typeConfig = {
  opportunity: { icon: '\u{1F4B0}', color: '#2ed573' },
  warning: { icon: '\u26A0\uFE0F', color: '#ffa502' },
  recommendation: { icon: '\u{1F4A1}', color: '#74b9ff' },
  trend: { icon: '\u{1F4C8}', color: '#a29bfe' },
  anomaly: { icon: '\u{1F50D}', color: '#e74c3c' },
  default: { icon: '\u{1F9E0}', color: '#a29bfe' },
};

const styles = {
  card: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'box-shadow 0.2s',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  iconWrap: (color) => ({
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  }),
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  description: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '13px',
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  confidence: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  confBar: {
    width: '60px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  confFill: (pct) => ({
    width: `${pct}%`,
    height: '100%',
    borderRadius: '2px',
    background: pct >= 70 ? '#2ed573' : pct >= 40 ? '#ffa502' : '#e74c3c',
    transition: 'width 0.4s ease',
  }),
  actionBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(108,92,231,0.15)',
    color: '#a29bfe',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};

const InsightCard = ({ insight = {} }) => {
  const {
    title = 'Insight',
    description = '',
    type = 'default',
    confidence = 0,
    action,
  } = insight;

  const cfg = typeConfig[type] || typeConfig.default;

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={styles.topRow}>
        <div style={styles.iconWrap(cfg.color)}>{cfg.icon}</div>
        <div style={styles.content}>
          <h4 style={styles.title}>{title}</h4>
          <p style={styles.description}>{description}</p>
        </div>
      </div>
      <div style={styles.footer}>
        <div style={styles.confidence}>
          <span>Confidence</span>
          <div style={styles.confBar}>
            <div style={styles.confFill(confidence)} />
          </div>
          <span>{confidence}%</span>
        </div>
        {action && (
          <button
            style={styles.actionBtn}
            onClick={action.onClick}
            onMouseEnter={(e) =>
              (e.target.style.background = 'rgba(108,92,231,0.3)')
            }
            onMouseLeave={(e) =>
              (e.target.style.background = 'rgba(108,92,231,0.15)')
            }
          >
            {action.label || 'View Details'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
