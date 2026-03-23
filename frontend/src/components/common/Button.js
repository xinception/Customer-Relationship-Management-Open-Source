import React from 'react';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    color: '#ffffff',
    border: 'none',
    hoverBg: 'linear-gradient(135deg, #5b4bd5, #918af0)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    hoverBg: 'rgba(255,255,255,0.12)',
  },
  danger: {
    background: 'rgba(231,76,60,0.15)',
    color: '#e74c3c',
    border: '1px solid rgba(231,76,60,0.3)',
    hoverBg: 'rgba(231,76,60,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: 'none',
    hoverBg: 'rgba(255,255,255,0.06)',
  },
};

const sizeStyles = {
  sm: { padding: '6px 14px', fontSize: '12px', borderRadius: '6px' },
  md: { padding: '9px 20px', fontSize: '13px', borderRadius: '8px' },
  lg: { padding: '12px 28px', fontSize: '15px', borderRadius: '10px' },
};

const Spinner = () => (
  <span
    style={{
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      marginRight: '8px',
    }}
  />
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style: customStyle,
  ...rest
}) => {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
    background: v.background,
    color: v.color,
    border: v.border,
    ...s,
    ...customStyle,
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        type={type}
        style={baseStyle}
        disabled={disabled || loading}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            if (variant === 'primary') {
              e.currentTarget.style.background = v.hoverBg;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(108,92,231,0.3)';
            } else {
              e.currentTarget.style.background = v.hoverBg;
            }
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = v.background;
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...rest}
      >
        {loading && <Spinner />}
        {children}
      </button>
    </>
  );
};

export default Button;
