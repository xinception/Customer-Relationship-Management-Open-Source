import React from 'react';

const stages = [
  { key: 'sent', label: 'Sent', color: '#6c5ce7' },
  { key: 'delivered', label: 'Delivered', color: '#a29bfe' },
  { key: 'opened', label: 'Opened', color: '#74b9ff' },
  { key: 'clicked', label: 'Clicked', color: '#ffa502' },
  { key: 'converted', label: 'Converted', color: '#2ed573' },
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  funnel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '40px',
  },
  segment: (color, widthPct) => ({
    height: '100%',
    width: `${Math.max(widthPct, 2)}%`,
    background: color,
    borderRadius: '4px',
    transition: 'width 0.6s ease',
    minWidth: '8px',
    position: 'relative',
  }),
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  stageLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: '1 1 0',
    minWidth: '60px',
  },
  dot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  labelText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
  },
  pct: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
  },
  arrow: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: '14px',
    flexShrink: 0,
  },
};

const MetricsBar = ({ metrics = {} }) => {
  const baseValue = metrics.sent || 1;

  return (
    <div style={styles.container}>
      <div style={styles.funnel}>
        {stages.map((stage, idx) => {
          const val = metrics[stage.key] || 0;
          const widthPct = (val / baseValue) * 100;
          return (
            <React.Fragment key={stage.key}>
              {idx > 0 && <span style={styles.arrow}>{'\u25B6'}</span>}
              <div
                style={styles.segment(stage.color, widthPct)}
                title={`${stage.label}: ${val.toLocaleString()}`}
              />
            </React.Fragment>
          );
        })}
      </div>

      <div style={styles.labels}>
        {stages.map((stage) => {
          const val = metrics[stage.key] || 0;
          const pct = baseValue > 0 ? Math.round((val / baseValue) * 100) : 0;
          return (
            <div key={stage.key} style={styles.stageLabel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.dot(stage.color)} />
                <span style={styles.labelText}>{stage.label}</span>
              </div>
              <span style={styles.value}>{val.toLocaleString()}</span>
              <span style={styles.pct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsBar;
