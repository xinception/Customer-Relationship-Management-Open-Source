import React from 'react';

const variantColors = {
  success: { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'rgba(46,213,115,0.3)' },
  warning: { bg: 'rgba(255,165,2,0.15)', color: '#ffa502', border: 'rgba(255,165,2,0.3)' },
  danger: { bg: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: 'rgba(231,76,60,0.3)' },
  info: { bg: 'rgba(116,185,255,0.15)', color: '#74b9ff', border: 'rgba(116,185,255,0.3)' },
  primary: { bg: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: 'rgba(108,92,231,0.3)' },
};

const sizeStyles = {
  sm: { padding: '2px 8px', fontSize: '10px' },
  md: { padding: '4px 10px', fontSize: '12px' },
  lg: { padding: '6px 14px', fontSize: '13px' },
};

const Badge = ({ text, variant = 'primary', size = 'md' }) => {
  const colors = variantColors[variant] || variantColors.primary;
  const sizing = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '20px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.color,
        ...sizing,
      }}
    >
      {text}
    </span>
  );
};

export default Badge;
