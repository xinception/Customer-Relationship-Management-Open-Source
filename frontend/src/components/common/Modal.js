import React, { useEffect, useCallback } from 'react';

const sizeMap = {
  sm: '400px',
  md: '560px',
  lg: '780px',
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: (size) => ({
    background: '#1e1e36',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    width: '90%',
    maxWidth: sizeMap[size] || sizeMap.md,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.25s ease',
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose && onClose();
      }}
    >
      <div style={styles.modal(size)}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.06)';
              e.target.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            {'\u2715'}
          </button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
