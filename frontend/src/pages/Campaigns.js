import React, { useState } from 'react';
import {
  HiOutlinePlus, HiOutlineSpeakerphone,
  HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineEye,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const campaigns = [
  { id: 1, name: 'Product Launch Q1 2026', type: 'Email', status: 'Active', sent: 4500, opened: 2835, clicked: 980, openRate: 63, clickRate: 21.8, revenue: 28500, progress: 72, startDate: 'Mar 1, 2026', endDate: 'Mar 31, 2026' },
  { id: 2, name: 'Welcome Series - New Users', type: 'Automation', status: 'Active', sent: 12300, opened: 8610, clicked: 3567, openRate: 70, clickRate: 29, revenue: 45200, progress: 88, startDate: 'Jan 1, 2026', endDate: 'Ongoing' },
  { id: 3, name: 'Re-engagement Campaign', type: 'Email', status: 'Active', sent: 2800, opened: 1120, clicked: 336, openRate: 40, clickRate: 12, revenue: 8400, progress: 45, startDate: 'Mar 10, 2026', endDate: 'Apr 10, 2026' },
  { id: 4, name: 'Enterprise Webinar Invite', type: 'Event', status: 'Draft', sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0, revenue: 0, progress: 0, startDate: 'Apr 5, 2026', endDate: 'Apr 5, 2026' },
  { id: 5, name: 'Holiday Season Promo', type: 'Email', status: 'Completed', sent: 8900, opened: 5785, clicked: 2314, openRate: 65, clickRate: 26, revenue: 72000, progress: 100, startDate: 'Dec 1, 2025', endDate: 'Dec 31, 2025' },
  { id: 6, name: 'Customer NPS Survey', type: 'Survey', status: 'Completed', sent: 3200, opened: 2240, clicked: 1440, openRate: 70, clickRate: 45, revenue: 0, progress: 100, startDate: 'Feb 1, 2026', endDate: 'Feb 28, 2026' },
  { id: 7, name: 'Spring Feature Announcement', type: 'Email', status: 'Draft', sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0, revenue: 0, progress: 0, startDate: 'Apr 15, 2026', endDate: 'Apr 30, 2026' },
  { id: 8, name: 'Win-back: Churned Accounts', type: 'Automation', status: 'Active', sent: 1560, opened: 780, clicked: 234, openRate: 50, clickRate: 15, revenue: 12500, progress: 35, startDate: 'Feb 15, 2026', endDate: 'May 15, 2026' },
];

const getTypeBadge = (type) => {
  const map = {
    Email: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    Automation: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
    Event: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
    Survey: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  };
  return map[type] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
};

const getStatusBadge = (status) => {
  const map = {
    Active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    Draft: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
    Completed: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  };
  return map[status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
};

export default function Campaigns() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Active', 'Draft', 'Completed'];

  const filtered = filter === 'All' ? campaigns : campaigns.filter(c => c.status === filter);
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const avgOpenRate = Math.round(activeCampaigns.reduce((sum, c) => sum + c.openRate, 0) / activeCampaigns.length);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Campaigns</h1>
          <p>Manage and monitor your marketing campaigns</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm"><HiOutlinePlus /> Create Campaign</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: <HiOutlineSpeakerphone />, color: '#3b82f6', label: 'Total Campaigns', value: campaigns.length, sub: '+2 this month' },
          { icon: <HiOutlineTrendingUp />, color: '#10b981', label: 'Active', value: activeCampaigns.length, sub: 'Running now' },
          { icon: <HiOutlineEye />, color: '#f59e0b', label: 'Avg Open Rate', value: avgOpenRate + '%', sub: '+4% vs last month' },
          { icon: <HiOutlineCurrencyDollar />, color: '#ec4899', label: 'Total Revenue', value: '$' + (totalRevenue / 1000).toFixed(0) + 'K', sub: 'From all campaigns' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#1a2332', borderRadius: '10px', padding: '4px', border: '1px solid #1e3348', width: 'fit-content' }}>
        {filters.map(f => (
          <button
            key={f}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px',
              background: filter === f ? '#3b82f6' : 'transparent',
              color: filter === f ? '#fff' : '#94a3b8',
              fontWeight: filter === f ? 600 : 500,
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {filtered.map(c => {
          const typeStyle = getTypeBadge(c.type);
          const statusStyle = getStatusBadge(c.status);
          return (
            <div
              key={c.id}
              style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => navigate('/campaigns/' + c.id)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e3348'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>{c.type}</span>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>{c.status}</span>
                  </div>
                </div>
                <HiOutlineChartBar style={{ color: '#64748b', fontSize: '18px' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{c.startDate} — {c.endDate}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Sent', value: c.sent > 0 ? c.sent.toLocaleString() : '—' },
                  { label: 'Opened', value: c.opened > 0 ? c.opened.toLocaleString() : '—' },
                  { label: 'Clicked', value: c.clicked > 0 ? c.clicked.toLocaleString() : '—' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>{m.value}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              {c.status === 'Active' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Progress</span>
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: '#1e3348', marginTop: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: '#3b82f6', width: c.progress + '%' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
