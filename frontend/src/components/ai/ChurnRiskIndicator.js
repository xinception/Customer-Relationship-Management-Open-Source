import React from 'react';

function getRiskLevel(risk) {
  if (risk >= 0.75) return { label: 'Critical', color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' };
  if (risk >= 0.5) return { label: 'High', color: '#ff6348', bg: 'rgba(255,99,72,0.15)' };
  if (risk >= 0.25) return { label: 'Medium', color: '#ffa502', bg: 'rgba(255,165,2,0.15)' };
  return { label: 'Low', color: '#2ed573', bg: 'rgba(46,213,115,0.15)' };
}

const recommendations = {
  Critical: 'Immediate intervention required. Schedule a personal outreach call and offer retention incentives.',
  High: 'Send a targeted re-engagement campaign. Consider offering exclusive benefits or discounts.',
  Medium: 'Monitor closely. Send a personalized check-in email to strengthen the relationship.',
  Low: 'Customer is healthy. Continue current engagement strategy and nurture the relationship.',
};

const styles = {
  container: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  name: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
  },
  badge: (level) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    color: level.color,
    background: level.bg,
    border: `1px solid ${level.color}30`,
  }),
  barBg: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  barFill: (risk, color) => ({
    width: `${Math.round(risk * 100)}%`,
    height: '100%',
    borderRadius: '4px',
    background: color,
    transition: 'width 0.6s ease',
  }),
  riskValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginBottom: '16px',
    display: 'block',
  },
  recommendation: {
    display: 'flex',
    gap: '10px',
    padding: '12px 14px',
    background: 'rgba(108,92,231,0.08)',
    borderRadius: '8px',
    borderLeft: '3px solid #6c5ce7',
  },
  recIcon: {
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '1px',
  },
  recText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '12px',
    lineHeight: 1.6,
    margin: 0,
  },
};

const ChurnRiskIndicator = ({ risk = 0, contactName = 'Contact' }) => {
  const clampedRisk = Math.max(0, Math.min(1, risk));
  const level = getRiskLevel(clampedRisk);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.name}>{contactName}</h4>
        <span style={styles.badge(level)}>{level.label} Risk</span>
      </div>
      <div style={styles.barBg}>
        <div style={styles.barFill(clampedRisk, level.color)} />
      </div>
      <span style={styles.riskValue}>
        Churn probability: {Math.round(clampedRisk * 100)}%
      </span>
      <div style={styles.recommendation}>
        <span style={styles.recIcon}>{'\u{1F4A1}'}</span>
        <p style={styles.recText}>{recommendations[level.label]}</p>
      </div>
    </div>
  );
};

export default ChurnRiskIndicator;
