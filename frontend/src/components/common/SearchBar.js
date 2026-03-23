import React, { useState, useRef, useEffect, useCallback } from 'react';

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputWrap: {
    position: 'relative',
    flex: 1,
  },
  icon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.3)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  filterBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: '#1e1e36',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    padding: '8px 0',
    minWidth: '180px',
    zIndex: 1100,
  },
  filterOption: (active) => ({
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    background: active ? 'rgba(108,92,231,0.15)' : 'transparent',
    border: 'none',
    color: active ? '#a29bfe' : 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s',
  }),
};

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  filters = [],
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const timerRef = useRef(null);
  const dropdownRef = useRef(null);

  const emitSearch = useCallback(
    (q, filter) => {
      if (onSearch) onSearch(q, filter);
    },
    [onSearch]
  );

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      emitSearch(query, activeFilter);
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [query, activeFilter, debounceMs, emitSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputWrap}>
        <span style={styles.icon}>{'\u{1F50D}'}</span>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          style={styles.input}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = '#6c5ce7')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
      </div>

      {filters.length > 0 && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            style={styles.filterBtn}
            onClick={() => setShowFilters((s) => !s)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            {'\u2630'} {activeFilter || 'Filter'}
          </button>
          {showFilters && (
            <div style={styles.dropdown}>
              <button
                style={styles.filterOption(!activeFilter)}
                onClick={() => {
                  setActiveFilter(null);
                  setShowFilters(false);
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = 'rgba(255,255,255,0.06)')
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = !activeFilter ? 'rgba(108,92,231,0.15)' : 'transparent')
                }
              >
                All
              </button>
              {filters.map((f) => (
                <button
                  key={f.value || f}
                  style={styles.filterOption(activeFilter === (f.value || f))}
                  onClick={() => {
                    setActiveFilter(f.value || f);
                    setShowFilters(false);
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = 'rgba(255,255,255,0.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background =
                      activeFilter === (f.value || f)
                        ? 'rgba(108,92,231,0.15)'
                        : 'transparent')
                  }
                >
                  {f.label || f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
