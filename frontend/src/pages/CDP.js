import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineDatabase, HiOutlineUserGroup, HiOutlineLink,
  HiOutlineFingerPrint, HiOutlineGlobe, HiOutlineMail,
  HiOutlineDeviceMobile, HiOutlineCode, HiOutlineCursorClick,
  HiOutlineDocumentText, HiOutlineShoppingCart, HiOutlineChatAlt2,
  HiOutlineDownload, HiOutlineEye, HiOutlineLogin,
  HiOutlineCheckCircle, HiOutlineExclamation,
} from 'react-icons/hi';

const stats = [
  { icon: <HiOutlineDatabase />, color: '#3b82f6', label: 'Total Events', value: '2.4M', sub: '+148K this week' },
  { icon: <HiOutlineUserGroup />, color: '#10b981', label: 'Profiles Unified', value: '4,640', sub: '98.2% match rate' },
  { icon: <HiOutlineLink />, color: '#8b5cf6', label: 'Data Sources', value: '12', sub: '4 active integrations' },
  { icon: <HiOutlineFingerPrint />, color: '#f59e0b', label: 'Identity Matches', value: '18.9K', sub: '+2.1K this month' },
];

const eventTypes = [
  { name: 'Page View', value: 42, color: '#3b82f6' },
  { name: 'Email Event', value: 24, color: '#10b981' },
  { name: 'Form Submit', value: 12, color: '#f59e0b' },
  { name: 'Purchase', value: 8, color: '#ec4899' },
  { name: 'API Call', value: 9, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const eventIcons = {
  'Page View': <HiOutlineEye />,
  'Email Open': <HiOutlineMail />,
  'Email Click': <HiOutlineCursorClick />,
  'Form Submit': <HiOutlineDocumentText />,
  'Purchase': <HiOutlineShoppingCart />,
  'Login': <HiOutlineLogin />,
  'Chat': <HiOutlineChatAlt2 />,
  'Download': <HiOutlineDownload />,
  'API Call': <HiOutlineCode />,
  'Page Exit': <HiOutlineGlobe />,
};

const events = [
  { id: 1, type: 'Page View', name: 'Viewed Pricing Page', contact: 'Sarah Chen', time: '2 min ago', source: 'Website' },
  { id: 2, type: 'Email Open', name: 'Opened "Product Launch" email', contact: 'Michael Roberts', time: '5 min ago', source: 'Email' },
  { id: 3, type: 'Purchase', name: 'Upgraded to Enterprise Plan', contact: 'Nicole Zhang', time: '8 min ago', source: 'Website' },
  { id: 4, type: 'Form Submit', name: 'Submitted Demo Request', contact: 'David Brown', time: '12 min ago', source: 'Website' },
  { id: 5, type: 'Email Click', name: 'Clicked CTA in Welcome email', contact: 'Amanda Torres', time: '15 min ago', source: 'Email' },
  { id: 6, type: 'Login', name: 'Logged into dashboard', contact: 'James Kim', time: '18 min ago', source: 'Website' },
  { id: 7, type: 'Page View', name: 'Viewed API Documentation', contact: 'Sarah Chen', time: '22 min ago', source: 'Website' },
  { id: 8, type: 'Chat', name: 'Started support chat', contact: 'Lisa Park', time: '25 min ago', source: 'Website' },
  { id: 9, type: 'Download', name: 'Downloaded whitepaper', contact: 'Chris Martinez', time: '28 min ago', source: 'Website' },
  { id: 10, type: 'API Call', name: 'Contact sync via REST API', contact: 'System', time: '30 min ago', source: 'API' },
  { id: 11, type: 'Email Open', name: 'Opened NPS Survey email', contact: 'Robert Lee', time: '35 min ago', source: 'Email' },
  { id: 12, type: 'Page View', name: 'Viewed Case Studies', contact: 'Emily Watson', time: '38 min ago', source: 'Website' },
  { id: 13, type: 'Purchase', name: 'Renewed annual subscription', contact: 'Thomas Grant', time: '42 min ago', source: 'Website' },
  { id: 14, type: 'Form Submit', name: 'Submitted feedback form', contact: 'Jennifer Adams', time: '45 min ago', source: 'Website' },
  { id: 15, type: 'Login', name: 'Logged into mobile app', contact: 'David Brown', time: '48 min ago', source: 'Mobile' },
  { id: 16, type: 'Email Click', name: 'Clicked link in newsletter', contact: 'Nicole Zhang', time: '52 min ago', source: 'Email' },
  { id: 17, type: 'Page View', name: 'Viewed Integration docs', contact: 'James Kim', time: '55 min ago', source: 'Website' },
  { id: 18, type: 'API Call', name: 'Bulk import via API', contact: 'System', time: '58 min ago', source: 'API' },
  { id: 19, type: 'Chat', name: 'Completed support chat', contact: 'Lisa Park', time: '1 hr ago', source: 'Website' },
  { id: 20, type: 'Page Exit', name: 'Left checkout page', contact: 'Amanda Torres', time: '1 hr ago', source: 'Website' },
];

const journeySteps = [
  { label: 'First Visit', detail: 'Organic Search', date: 'Mar 1', color: '#3b82f6' },
  { label: 'Whitepaper', detail: 'Downloaded guide', date: 'Mar 3', color: '#10b981' },
  { label: 'Email Engaged', detail: 'Opened 3 emails', date: 'Mar 5', color: '#f59e0b' },
  { label: 'Demo Request', detail: 'Form submitted', date: 'Mar 8', color: '#8b5cf6' },
  { label: 'Demo Call', detail: '45 min meeting', date: 'Mar 12', color: '#ec4899' },
  { label: 'Pricing View', detail: 'Enterprise plan', date: 'Mar 15', color: '#f59e0b' },
  { label: 'Purchase', detail: 'Enterprise deal', date: 'Mar 20', color: '#10b981' },
];

const dataSources = [
  { name: 'Website', icon: <HiOutlineGlobe />, status: 'connected', events: '1.2M', lastSync: '2 min ago', color: '#3b82f6' },
  { name: 'Email', icon: <HiOutlineMail />, status: 'connected', events: '680K', lastSync: '5 min ago', color: '#10b981' },
  { name: 'Mobile App', icon: <HiOutlineDeviceMobile />, status: 'connected', events: '420K', lastSync: '15 min ago', color: '#8b5cf6' },
  { name: 'REST API', icon: <HiOutlineCode />, status: 'connected', events: '98K', lastSync: '30 min ago', color: '#f59e0b' },
];

const getSourceBadge = (source) => {
  const map = {
    Website: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    Email: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    Mobile: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
    API: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  };
  return map[source] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
};

export default function CDP() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customer Data Platform</h1>
          <p>Unified customer data and event tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
            <div style={{ color: s.color, fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Event Stream */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Live Event Stream</div>
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} /> Live
            </span>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {events.map(evt => {
              const srcStyle = getSourceBadge(evt.source);
              return (
                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e3348' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '14px', flexShrink: 0 }}>
                    {eventIcons[evt.type] || <HiOutlineDatabase />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{evt.contact}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>{evt.time}</span>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: srcStyle.bg, color: srcStyle.color, flexShrink: 0 }}>{evt.source}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Type Distribution */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Event Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={eventTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {eventTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px' }}>
            {eventTypes.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Journey */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Customer Journey: Sarah Chen</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>From first touch to conversion in 20 days</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', overflowX: 'auto', paddingBottom: '12px' }}>
          {journeySteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step.color + '20', border: '2px solid ' + step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.color }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', textAlign: 'center' }}>{step.label}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>{step.detail}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{step.date}</div>
              </div>
              {i < journeySteps.length - 1 && (
                <div style={{ width: '40px', height: '2px', background: '#1e3348', marginTop: '-30px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Data Sources</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {dataSources.map(ds => (
            <div key={ds.name} style={{ background: '#0f1923', borderRadius: '10px', padding: '20px', border: '1px solid #1e3348' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ds.color + '20', color: ds.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {ds.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: '14px' }} />
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Connected</span>
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{ds.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Last sync: {ds.lastSync}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{ds.events}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>events tracked</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
