import React, { useState, useMemo } from 'react';

const eventTypeConfig = {
  page_view: { icon: '\u{1F4C4}', color: '#74b9ff' },
  click: { icon: '\u{1F5B1}\uFE0F', color: '#a29bfe' },
  form_submit: { icon: '\u{1F4DD}', color: '#2ed573' },
  purchase: { icon: '\u{1F6D2}', color: '#ffa502' },
  email_open: { icon: '\u{1F4E7}', color: '#fd79a8' },
  email_click: { icon: '\u{1F517}', color: '#e17055' },
  login: { icon: '\u{1F511}', color: '#00cec9' },
  signup: { icon: '\u{1F389}', color: '#6c5ce7' },
  api_call: { icon: '\u{1F310}', color: '#636e72' },
  custom: { icon: '\u26A1', color: '#dfe6e9' },
  default: { icon: '\u{1F4CC}', color: '#b2bec3' },
};

const sourceColors = {
  web: '#74b9ff',
  mobile: '#2ed573',
  api: '#ffa502',
  email: '#fd79a8',
  default: '#a29bfe',
};

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  filters: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  filterBtn: (active) => ({
    padding: '5px 12px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
  }),
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.15s',
  },
  iconWrap: (color) => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: `${color}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    flexShrink: 0,
  }),
  content: {
    flex: 1,
    minWidth: 0,
  },
  eventName: {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 600,
    margin: 0,
  },
  contactName: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: '2px 0 0 0',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    flexShrink: 0,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  sourceBadge: (color) => ({
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: color,
    background: `${color}15`,
    border: `1px solid ${color}30`,
  }),
  empty: {
    textAlign: 'center',
    padding: '32px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#2ed573',
    animation: 'pulse 2s ease infinite',
  },
};

const EventStream = ({ events = [] }) => {
  const [filter, setFilter] = useState('all');

  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type));
    return ['all', ...Array.from(types)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  return (
    <div style={styles.container}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      <div style={styles.liveIndicator}>
        <span style={styles.liveDot} />
        Live Event Stream
      </div>

      {eventTypes.length > 2 && (
        <div style={styles.filters}>
          {eventTypes.map((t) => (
            <button
              key={t}
              style={styles.filterBtn(filter === t)}
              onClick={() => setFilter(t)}
            >
              {t === 'all'
                ? 'All'
                : t
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
            </button>
          ))}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div style={styles.empty}>No events to display</div>
      ) : (
        filteredEvents.map((event, idx) => {
          const cfg =
            eventTypeConfig[event.type] || eventTypeConfig.default;
          const srcColor =
            sourceColors[event.source] || sourceColors.default;

          return (
            <div
              key={event.id || idx}
              style={styles.item}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <div style={styles.iconWrap(cfg.color)}>{cfg.icon}</div>
              <div style={styles.content}>
                <p style={styles.eventName}>
                  {event.name ||
                    event.type
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                </p>
                {event.contactName && (
                  <p style={styles.contactName}>{event.contactName}</p>
                )}
              </div>
              <div style={styles.right}>
                <span style={styles.timestamp}>
                  {formatTime(event.timestamp)}
                </span>
                {event.source && (
                  <span style={styles.sourceBadge(srcColor)}>
                    {event.source}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default EventStream;
