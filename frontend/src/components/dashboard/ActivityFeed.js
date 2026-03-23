import React from 'react';

const typeIcons = {
  email: '\u{1F4E7}',
  call: '\u{1F4DE}',
  meeting: '\u{1F4C5}',
  deal: '\u{1F4B0}',
  contact: '\u{1F464}',
  note: '\u{1F4DD}',
  task: '\u2705',
  campaign: '\u{1F4E3}',
  default: '\u{1F50D}',
};

function getRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const styles = {
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.15s',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(108,92,231,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    margin: 0,
    lineHeight: 1.5,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    padding: '32px 0',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
};

const ActivityFeed = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div style={styles.empty}>
        No recent activity
      </div>
    );
  }

  return (
    <div style={styles.feed}>
      {activities.map((activity, idx) => (
        <div key={activity.id || idx} style={styles.item}>
          <div style={styles.iconWrap}>
            {activity.icon || typeIcons[activity.type] || typeIcons.default}
          </div>
          <div style={styles.content}>
            <p style={styles.description}>{activity.description}</p>
            <div style={styles.timestamp}>
              {getRelativeTime(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
