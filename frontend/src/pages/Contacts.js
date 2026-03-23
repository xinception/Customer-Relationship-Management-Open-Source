import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch, HiOutlineFilter, HiOutlineDownload,
  HiOutlineUpload, HiOutlineTrash, HiOutlinePencil,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus,
} from 'react-icons/hi';

const mockContacts = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.chen@techcorp.com', company: 'TechCorp Inc.', score: 92, status: 'Active', lastActive: '2 hours ago', tags: ['Enterprise', 'Hot Lead'] },
  { id: 2, name: 'Michael Roberts', email: 'michael.r@innovate.io', company: 'Innovate.io', score: 85, status: 'Active', lastActive: '5 hours ago', tags: ['MQL', 'Product Interest'] },
  { id: 3, name: 'Emily Watson', email: 'emily.w@startupxyz.com', company: 'StartupXYZ', score: 78, status: 'Active', lastActive: '1 day ago', tags: ['SMB', 'Trial User'] },
  { id: 4, name: 'James Kim', email: 'james.kim@globalco.com', company: 'GlobalCo', score: 71, status: 'Active', lastActive: '1 day ago', tags: ['Enterprise', 'SQL'] },
  { id: 5, name: 'Lisa Park', email: 'lisa.park@designhub.co', company: 'DesignHub', score: 65, status: 'Inactive', lastActive: '5 days ago', tags: ['SMB', 'Churning'] },
  { id: 6, name: 'David Brown', email: 'd.brown@megasoft.com', company: 'MegaSoft', score: 58, status: 'Active', lastActive: '3 hours ago', tags: ['Enterprise', 'Renewal'] },
  { id: 7, name: 'Amanda Torres', email: 'a.torres@cloudnine.io', company: 'CloudNine', score: 45, status: 'Inactive', lastActive: '2 weeks ago', tags: ['Cold Lead'] },
  { id: 8, name: 'Robert Lee', email: 'r.lee@datastream.com', company: 'DataStream', score: 88, status: 'Active', lastActive: '30 min ago', tags: ['Enterprise', 'Hot Lead', 'Demo Requested'] },
  { id: 9, name: 'Jennifer Adams', email: 'j.adams@retailpro.com', company: 'RetailPro', score: 34, status: 'Bounced', lastActive: '1 month ago', tags: ['Unresponsive'] },
  { id: 10, name: 'Chris Martinez', email: 'c.martinez@fintech.io', company: 'FinTech Solutions', score: 76, status: 'Active', lastActive: '4 hours ago', tags: ['MQL', 'Webinar Attendee'] },
  { id: 11, name: 'Nicole Zhang', email: 'n.zhang@aiworks.com', company: 'AI Works', score: 91, status: 'Active', lastActive: '1 hour ago', tags: ['Enterprise', 'SQL', 'Decision Maker'] },
  { id: 12, name: 'Thomas Grant', email: 't.grant@buildco.com', company: 'BuildCo', score: 52, status: 'Active', lastActive: '3 days ago', tags: ['SMB'] },
];

export default function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const statusFilters = ['All', 'Active', 'Inactive', 'Bounced'];

  const filtered = mockContacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const getStatusBadge = (status) => {
    const map = { Active: 'badge-green', Inactive: 'badge-yellow', Bounced: 'badge-red' };
    return map[status] || 'badge-gray';
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Contacts</h1>
          <p>{mockContacts.length} total contacts in your CRM</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm"><HiOutlineDownload /> Export</button>
          <button className="btn btn-outline btn-sm"><HiOutlineUpload /> Import</button>
          <button className="btn btn-primary btn-sm"><HiOutlinePlus /> Add Contact</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {statusFilters.map((f) => (
            <button
              key={f}
              className={`filter-pill ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm"><HiOutlineFilter /> More Filters</button>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="card" style={{ marginBottom: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
            {selected.length} selected
          </span>
          <button className="btn btn-sm btn-outline"><HiOutlinePencil /> Edit</button>
          <button className="btn btn-sm btn-outline"><HiOutlineSpeakerphone /> Add to Campaign</button>
          <button className="btn btn-sm btn-danger"><HiOutlineTrash /> Delete</button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length > 0} />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Score</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                        {contact.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{contact.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.email}</td>
                  <td>{contact.company}</td>
                  <td>
                    <span className={`score-badge ${getScoreClass(contact.score)}`}>{contact.score}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(contact.status)}`}>{contact.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.lastActive}</td>
                  <td>
                    <div className="tags">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="tag">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination" style={{ padding: '12px 16px' }}>
          <div className="pagination-info">
            Showing {filtered.length} of {mockContacts.length} contacts
          </div>
          <div className="pagination-buttons">
            <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <HiOutlineChevronLeft />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="pagination-btn" onClick={() => setPage(page + 1)}>
              <HiOutlineChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
