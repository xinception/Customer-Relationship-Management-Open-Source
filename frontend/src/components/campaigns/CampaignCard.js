import React from 'react';
import Badge from '../common/Badge';

const statusVariants = {
  active: 'success',
  draft: 'info',
  paused: 'warning',
  completed: 'primary',
  failed: 'danger',
};

const typeIcons = {
  email: '\u{1F4E7}',
  sms: '\u{1F4F1}',
  push: '\u{1F514}',
  social: '\u{1F310}',
  default: '\u{1F4E3}',
};

const styles = {
  card: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  typeIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  title: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  metrics: {
    display: 'flex',
    gap: '20px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  progressWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    width: `${Math.min(100, pct)}%`,
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
    transition: 'width 0.6s ease',
  }),
  progressLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    textAlign: 'right',
  },
};

const CampaignCard = ({ campaign = {} }) => {
  const {
    name = 'Untitled Campaign',
    status = 'draft',
    type = 'email',
    sent = 0,
    opened = 0,
    clicked = 0,
    progress,
  } = campaign;

  const icon = typeIcons[type] || typeIcons.default;

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.typeIcon}>{icon}</span>
          <h4 style={styles.title}>{name}</h4>
        </div>
        <Badge
          text={status.charAt(0).toUpperCase() + status.slice(1)}
          variant={statusVariants[status] || 'info'}
          size="sm"
        />
      </div>

      <div style={styles.metrics}>
        <div style={styles.metric}>
          <span style={styles.metricValue}>{sent.toLocaleString()}</span>
          <span style={styles.metricLabel}>Sent</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricValue}>{opened.toLocaleString()}</span>
          <span style={styles.metricLabel}>Opened</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricValue}>{clicked.toLocaleString()}</span>
          <span style={styles.metricLabel}>Clicked</span>
        </div>
      </div>

      {status === 'active' && progress !== undefined && (
        <div style={styles.progressWrap}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(progress)} />
          </div>
          <span style={styles.progressLabel}>{Math.round(progress)}% complete</span>
        </div>
      )}
    </div>
  );
};

export default CampaignCard;
