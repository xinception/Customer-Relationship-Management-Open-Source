import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineSearch, HiOutlineDatabase, HiOutlineRefresh,
  HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineSparkles,
  HiOutlineGlobe, HiOutlineMail, HiOutlineCursorClick,
  HiOutlineShoppingCart, HiOutlineUserAdd, HiOutlineDocumentText,
} from 'react-icons/hi';

const eventStream = [
  { id: 1, type: 'Page View', user: 'sarah.chen@techcorp.com', detail: '/pricing - Enterprise Plan', time: '2 sec ago', color: '#3b82f6' },
  { id: 2, type: 'Email Open', user: 'michael.r@innovate.io', detail: 'Campaign: Product Launch Q1', time: '5 sec ago', color: '#10b981' },
  { id: 3, type: 'Form Submit', user: 'emily.w@startupxyz.com', detail: 'Demo Request Form', time: '12 sec ago', color: '#8b5cf6' },
  { id: 4, type: 'Purchase', user: 'james.kim@globalco.com', detail: 'Pro Plan - $299/mo', time: '28 sec ago', color: '#f59e0b' },
  { id: 5, type: 'Page View', user: 'lisa.park@designhub.co', detail: '/features - Integration APIs', time: '35 sec ago', color: '#3b82f6' },
  { id: 6, type: 'Email Click', user: 'david.brown@megasoft.com', detail: 'CTA: Schedule Demo', time: '42 sec ago', color: '#ec4899' },
  { id: 7, type: 'Sign Up', user: 'alex.novak@newco.com', detail: 'Free Trial - via Google Ads', time: '1 min ago', color: '#06b6d4' },
  { id: 8, type: 'Page View', user: 'robert.lee@datastream.com', detail: '/case-studies', time: '1 min ago', color: '#3b82f6' },
  { id: 9, type: 'Email Open', user: 'jennifer.adams@retailpro.com', detail: 'Campaign: Re-engagement', time: '2 min ago', color: '#10b981' },
  { id: 10, type: 'Purchase', user: 'chris.m@fintech.io', detail: 'Enterprise Plan - $799/mo', time: '2 min ago', color: '#f59e0b' },
  { id: 11, type: 'Form Submit', user: 'nicole.zhang@aiworks.com', detail: 'Contact Sales Form', time: '3 min ago', color: '#8b5cf6' },
  { id: 12, type: 'Page View', user: 'thomas.grant@buildco.com', detail: '/blog/ai-in-crm', time: '3 min ago', color: '#3b82f6' },
];

const dataSources = [
  { name: 'Website Tracking', status: 'Connected', events: '45.2K', lastSync: '2 sec ago', icon: <HiOutlineGlobe />, color: '#3b82f6' },
  { name: 'Email Platform', status: 'Connected', events: '28.1K', lastSync: '5 min ago', icon: <HiOutlineMail />, color: '#10b981' },
  { name: 'E-commerce', status: 'Connected', events: '12.8K', lastSync: '10 min ago', icon: <HiOutlineShoppingCart />, color: '#f59e0b' },
  { name: 'CRM Sync', status: 'Connected', events: '8.4K', lastSync: '1 min ago', icon: <HiOutlineDatabase />, color: '#8b5cf6' },
  { name: 'Social Media', status: 'Warning', events: '3.2K', lastSync: '2 hours ago', icon: <HiOutlineCursorClick />, color: '#ec4899' },
  { name: 'Support Tickets', status: 'Connected', events: '5.6K', lastSync: '15 min ago', icon: <HiOutlineDocumentText />, color: '#06b6d4' },
];

const eventTypeData = [
  { name: 'Page View', value: 42, color: '#3b82f6' },
  { name: 'Email', value: 25, color: '#10b981' },
  { name: 'Form Submit', value: 12, color: '#8b5cf6' },
  { name: 'Purchase', value: 8, color: '#f59e0b' },
  { name: 'Sign Up', value: 7, color: '#06b6d4' },
  { name: 'Other', value: 6, color: '#64748b' },
];

const identityStats = {
  totalProfiles: 2420,
  mergedProfiles: 187,
  matchRate: 94.2,
  avgEventsPerProfile: 38,
};

const eventVolumeData = [
  { hour: '00', events: 120 }, { hour: '02', events: 85 },
  { hour: '04', events: 65 }, { hour: '06', events: 180 },
  { hour: '08', events: 450 }, { hour: '10', events: 680 },
  { hour: '12', events: 520 }, { hour: '14', events: 610 },
  { hour: '16', events: 540 }, { hour: '18', events: 380 },
  { hour: '20', events: 250 }, { hour: '22', events: 160 },
];

const journeySteps = [
  { step: 'First Visit', detail: 'Landed on /blog/ai-crm-guide via Google', date: 'Dec 1' },
  { step: 'Newsletter Signup', detail: 'Subscribed to weekly digest', date: 'Dec 3' },
  { step: 'Content Engaged', detail: 'Opened 4 emails, viewed 8 pages', date: 'Dec 5-12' },
  { step: 'Demo Request', detail: 'Submitted demo request form', date: 'Dec 14' },
  { step: 'Sales Meeting', detail: 'Attended product demo call', date: 'Dec 16' },
  { step: 'Trial Started', detail: 'Started 14-day free trial', date: 'Dec 17' },
  { step: 'Purchase', detail: 'Converted to Pro Plan ($299/mo)', date: 'Dec 28' },
];

export default function CDP() {
  const [searchQuery, setSearchQuery] = useState('');

  const getEventIcon = (type) => {
    const map = {
      'Page View': <HiOutlineGlobe />,
      'Email Open': <HiOutlineMail />,
      'Email Click': <HiOutlineCursorClick />,
      'Form Submit': <HiOutlineDocumentText />,
      'Purchase': <HiOutlineShoppingCart />,
      'Sign Up': <HiOutlineUserAdd />,
    };
    return map[type] || <HiOutlineDatabase />;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customer Data Platform</h1>
          <p>Unified customer profiles and real-time event tracking</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm"><HiOutlineRefresh /> Sync All</button>
          <button className="btn btn-primary btn-sm"><HiOutlineDatabase /> Add Source</button>
        </div>
      </div>

      {/* Identity Resolution Stats */}
      <div className="kpi-grid stagger">
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><HiOutlineUserAdd /></div>
          <div className="kpi-label">Total Profiles</div>
          <div className="kpi-value">{identityStats.totalProfiles.toLocaleString()}</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green"><HiOutlineCheckCircle /></div>
          <div className="kpi-label">Merged Profiles</div>
          <div className="kpi-value">{identityStats.mergedProfiles}</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple"><HiOutlineSparkles /></div>
          <div className="kpi-label">Match Rate</div>
          <div className="kpi-value">{identityStats.matchRate}%</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange"><HiOutlineDatabase /></div>
          <div className="kpi-label">Avg Events/Profile</div>
          <div className="kpi-value">{identityStats.avgEventsPerProfile}</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Event Stream */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Live Event Stream</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Real-time
              </div>
            </div>
          </div>
          <div className="event-stream">
            {eventStream.map((event) => (
              <div key={event.id} className="event-item">
                <span className="event-dot" style={{ background: event.color }} />
                <span style={{ color: event.color, fontSize: '16px' }}>{getEventIcon(event.type)}</span>
                <span className="event-type">{event.type}</span>
                <span className="event-detail">
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{event.user.split('@')[0]}</span>
                  {' - '}{event.detail}
                </span>
                <span className="event-time">{event.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Lookup + Event Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Lookup */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Profile Lookup</div>
            </div>
            <div className="search-box" style={{ maxWidth: '100%' }}>
              <HiOutlineSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by email, name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>SC</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Sarah Chen</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>sarah.chen@techcorp.com</div>
                  </div>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Score: 92</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>156</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Events</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>4</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sources</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>2</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Identities</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event Type Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Event Distribution</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={eventTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {eventTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {eventTypeData.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div className="chart-title">Data Sources</div>
            <span className="badge badge-green">{dataSources.filter(d => d.status === 'Connected').length} connected</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {dataSources.map((source) => (
              <div key={source.name} style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: `1px solid ${source.status === 'Warning' ? 'var(--warning)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ color: source.color, fontSize: '20px' }}>{source.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{source.name}</span>
                  {source.status === 'Connected' ? (
                    <HiOutlineCheckCircle style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                  ) : (
                    <HiOutlineExclamation style={{ color: 'var(--warning)', marginLeft: 'auto' }} />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Events: <strong style={{ color: 'var(--text-primary)' }}>{source.events}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Last: {source.lastSync}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Volume */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Event Volume (Today)</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="events" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Journey */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Sample Customer Journey</div>
            <span className="badge badge-green">Converted</span>
          </div>
          <div className="workflow-steps">
            {journeySteps.map((step, i) => (
              <div key={i} className="workflow-step">
                <div className="step-icon" style={{
                  background: i === journeySteps.length - 1 ? 'var(--success-light)' : 'var(--primary-light)',
                  color: i === journeySteps.length - 1 ? 'var(--success)' : 'var(--primary)',
                  fontSize: '14px', fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div className="step-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="step-title">{step.step}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.date}</span>
                  </div>
                  <div className="step-desc">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
