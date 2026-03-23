import React from 'react';

function getColor(score) {
  if (score >= 70) return '#2ed573';
  if (score >= 40) return '#ffa502';
  return '#e74c3c';
}

function getGradientId(score) {
  return `gauge-gradient-${Math.round(score)}`;
}

const ScoreGauge = ({ score = 0, label = 'Score', size = 120 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const center = size / 2;
  const color = getColor(clampedScore);
  const gradId = getGradientId(clampedScore);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e74c3c" />
              <stop offset="50%" stopColor="#ffa502" />
              <stop offset="100%" stopColor="#2ed573" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: size * 0.28,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {Math.round(clampedScore)}
          </span>
        </div>
      </div>
      <span
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default ScoreGauge;
