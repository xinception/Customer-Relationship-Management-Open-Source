import React, { useState, useMemo } from 'react';

const styles = {
  wrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'default',
    position: 'sticky',
    top: 0,
    background: '#1e1e36',
  },
  thSortable: {
    cursor: 'pointer',
  },
  sortArrow: {
    marginLeft: '6px',
    fontSize: '10px',
  },
  td: {
    padding: '14px 16px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  row: {
    transition: 'background 0.15s',
    cursor: 'default',
  },
  rowClickable: {
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 16px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '12px',
    display: 'block',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  pageInfo: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
  pageButtons: {
    display: 'flex',
    gap: '4px',
  },
  pageBtn: (active) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: active ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
};

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  sortable = false,
  pagination = null,
  emptyMessage = 'No data available',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = pagination?.pageSize || 10;

  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' \u2195';
    return sortConfig.direction === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  ...(sortable ? styles.thSortable : {}),
                  width: col.width || 'auto',
                }}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortable && (
                  <span style={styles.sortArrow}>{getSortIndicator(col.key)}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.empty}>
                <span style={styles.emptyIcon}>{'\u{1F4ED}'}</span>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                style={{
                  ...styles.row,
                  ...(onRowClick ? styles.rowClickable : {}),
                }}
                onClick={() => onRowClick && onRowClick(row)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>
          <div style={styles.pageButtons}>
            <button
              style={styles.pageBtn(false)}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {'\u276E'}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  style={styles.pageBtn(page === currentPage)}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              style={styles.pageBtn(false)}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {'\u276F'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
