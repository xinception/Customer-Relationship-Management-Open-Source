import React from 'react';

const channelConfig = {
  email: { color: '#74b9ff', icon: '\u{1F4E7}' },
  web: { color: '#2ed573', icon: '\u{1F310}' },
  phone: { color: '#ffa502', icon: '\u{1F4DE}' },
  sms: { color: '#fd79a8', icon: '\u{1F4F1}' },
  social: { color: '#a29bfe', icon: '\u{1F4F2}' },
  chat: { color: '#00cec9', icon: '\u{1F4AC}' },
  meeting: { color: '#e17055', icon: '\u{1F91D}' },
  default: { color: '#b2bec3', icon: '\u{1F4CC}' },
};

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = {
  container: {
    overflowX: 'auto',
    padding: '20px 0',
  },
  timeline: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    minWidth: 'max-content',
    position: 'relative',
    padding: '0 20px',
  },
  node: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    minWidth: '110px',
  },
  nodeIcon: (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: `${color}20`,
    border: `3px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    zIndex: 2,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }),
  nodeLabel: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '10px',
    textAlign: 'center',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nodeDate: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    marginTop: '4px',
  },
  nodeType: (color) => ({
    color: color,
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '4px',
  }),
  connector: (color) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '24px',
  }),
  connectorLine: (color) => ({
    width: '40px',
    height: '3px',
    background: `linear-gradient(90deg, ${color}, ${color}60)`,
    borderRadius: '2px',
  }),
  connectorArrow: (color) => ({
    color: `${color}80`,
    fontSize: '10px',
    marginLeft: '-2px',
  }),
  empty: {
    textAlign: 'center',
    padding: '32px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '16px 20px 0 20px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    marginTop: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
  },
  legendDot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
  }),
};

const JourneyMap = ({ touchpoints = [] }) => {
  if (touchpoints.length === 0) {
    return <div style={styles.empty}>No journey data available</div>;
  }

  const usedChannels = [
    ...new Set(touchpoints.map((t) => t.type || t.channel || 'default')),
  ];

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.timeline}>
          {touchpoints.map((tp, idx) => {
            const channel = tp.type || tp.channel || 'default';
            const cfg = channelConfig[channel] || channelConfig.default;
            const nextChannel =
              idx < touchpoints.length - 1
                ? touchpoints[idx + 1].type ||
                  touchpoints[idx + 1].channel ||
                  'default'
                : null;
            const nextCfg = nextChannel
              ? channelConfig[nextChannel] || channelConfig.default
              : null;

            return (
              <React.Fragment key={tp.id || idx}>
                <div style={styles.node}>
                  <div
                    style={styles.nodeIcon(cfg.color)}
                    title={`${tp.label || channel} - ${tp.date || ''}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = `0 0 20px ${cfg.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {tp.icon || cfg.icon}
                  </div>
                  <span style={styles.nodeLabel}>
                    {tp.label || channel}
                  </span>
                  {tp.date && (
                    <span style={styles.nodeDate}>{formatDate(tp.date)}</span>
                  )}
                  <span style={styles.nodeType(cfg.color)}>{channel}</span>
                </div>
                {idx < touchpoints.length - 1 && (
                  <div style={styles.connector(cfg.color)}>
                    <div
                      style={styles.connectorLine(
                        nextCfg ? nextCfg.color : cfg.color
                      )}
                    />
                    <span
                      style={styles.connectorArrow(
                        nextCfg ? nextCfg.color : cfg.color
                      )}
                    >
                      {'\u25B6'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={styles.legend}>
        {usedChannels.map((ch) => {
          const cfg = channelConfig[ch] || channelConfig.default;
          return (
            <div key={ch} style={styles.legendItem}>
              <span style={styles.legendDot(cfg.color)} />
              {ch.charAt(0).toUpperCase() + ch.slice(1)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyMap;
