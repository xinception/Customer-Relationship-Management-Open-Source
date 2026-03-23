import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  HiOutlineUserGroup, HiOutlineSpeakerphone, HiOutlineTrendingUp,
  HiOutlineCurrencyDollar, HiOutlineCursorClick,
} from 'react-icons/hi';

const contactGrowth = [
  { month: 'Apr', contacts: 1100, newContacts: 180 }, { month: 'May', contacts: 1280, newContacts: 210 },
  { month: 'Jun', contacts: 1490, newContacts: 240 }, { month: 'Jul', contacts: 1720, newContacts: 260 },
  { month: 'Aug', contacts: 1980, newContacts: 290 }, { month: 'Sep', contacts: 2270, newContacts: 320 },
  { month: 'Oct', contacts: 2590, newContacts: 350 }, { month: 'Nov', contacts: 2940, newContacts: 380 },
  { month: 'Dec', contacts: 3320, newContacts: 410 }, { month: 'Jan', contacts: 3730, newContacts: 440 },
  { month: 'Feb', contacts: 4170, newContacts: 470 }, { month: 'Mar', contacts: 4640, newContacts: 500 },
];

const campaignComparison = [
  { name: 'Welcome', sent: 12300, opened: 8610, clicked: 3567, converted: 890 },
  { name: 'Product', sent: 4500, opened: 2835, clicked: 980, converted: 145 },
  { name: 'Re-engage', sent: 2800, opened: 1120, clicked: 336, converted: 67 },
  { name: 'Holiday', sent: 8900, opened: 5785, clicked: 2314, converted: 578 },
  { name: 'Win-back', sent: 1560, opened: 780, clicked: 234, converted: 47 },
  { name: 'Survey', sent: 3200, opened: 2240, clicked: 1440, converted: 288 },
];

const revenueData = [
  { month: 'Apr', revenue: 38000, target: 35000 }, { month: 'May', revenue: 42000, target: 40000 },
  { month: 'Jun', revenue: 45000, target: 43000 }, { month: 'Jul', revenue: 48000, target: 46000 },
  { month: 'Aug', revenue: 52000, target: 49000 }, { month: 'Sep', revenue: 58000, target: 53000 },
  { month: 'Oct', revenue: 61000, target: 57000 }, { month: 'Nov', revenue: 67000, target: 62000 },
  { month: 'Dec', revenue: 78000, target: 68000 }, { month: 'Jan', revenue: 72000, target: 70000 },
  { month: 'Feb', revenue: 76000, target: 73000 }, { month: 'Mar', revenue: 84000, target: 78000 },
];

const trafficSources = [
  { name: 'Organic Search', value: 35, color: '#3b82f6' },
  { name: 'Email', value: 28, color: '#10b981' },
  { name: 'Social Media', value: 18, color: '#8b5cf6' },
  { name: 'Referral', value: 12, color: '#f59e0b' },
  { name: 'Direct', value: 7, color: '#ec4899' },
];

const engagementData = [
  { month: 'Apr', emailOpens: 4200, pageViews: 8500, formSubmits: 320 },
  { month: 'May', emailOpens: 4800, pageViews: 9200, formSubmits: 380 },
  { month: 'Jun', emailOpens: 5100, pageViews: 9800, formSubmits: 420 },
  { month: 'Jul', emailOpens: 5600, pageViews: 10500, formSubmits: 460 },
  { month: 'Aug', emailOpens: 5900, pageViews: 11200, formSubmits: 510 },
  { month: 'Sep', emailOpens: 6400, pageViews: 12100, formSubmits: 560 },
  { month: 'Oct', emailOpens: 6800, pageViews: 12800, formSubmits: 620 },
  { month: 'Nov', emailOpens: 7200, pageViews: 13600, formSubmits: 680 },
  { month: 'Dec', emailOpens: 7800, pageViews: 15200, formSubmits: 750 },
  { month: 'Jan', emailOpens: 7100, pageViews: 14100, formSubmits: 700 },
  { month: 'Feb', emailOpens: 7500, pageViews: 14800, formSubmits: 730 },
  { month: 'Mar', emailOpens: 8200, pageViews: 16000, formSubmits: 810 },
];

const funnelData = [
  { label: 'Visitors', value: 48200, color: '#3b82f6' },
  { label: 'Leads', value: 12800, color: '#6366f1' },
  { label: 'MQLs', value: 5400, color: '#8b5cf6' },
  { label: 'SQLs', value: 2100, color: '#ec4899' },
  { label: 'Customers', value: 680, color: '#10b981' },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('12m');
  const ranges = ['7d', '30d', '90d', '12m'];

  const kpis = [
    { icon: <HiOutlineUserGroup />, color: '#3b82f6', label: 'Total Contacts', value: '4,640', change: '+12.8%' },
    { icon: <HiOutlineSpeakerphone />, color: '#10b981', label: 'Campaigns Sent', value: '24', change: '+6 this month' },
    { icon: <HiOutlineTrendingUp />, color: '#f59e0b', label: 'Conversion Rate', value: '5.8%', change: '+0.9%' },
    { icon: <HiOutlineCurrencyDollar />, color: '#ec4899', label: 'Revenue', value: '$84K', change: '+10.5%' },
    { icon: <HiOutlineCursorClick />, color: '#8b5cf6', label: 'Engagement Rate', value: '68%', change: '+4.2%' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>Comprehensive insights into your CRM performance</p>
        </div>
        <div className="page-header-actions">
          <div style={{ display: 'flex', background: '#1a2332', borderRadius: '10px', padding: '4px', border: '1px solid #1e3348' }}>
            {ranges.map(r => (
              <button key={r} onClick={() => setDateRange(r)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  background: dateRange === r ? '#3b82f6' : 'transparent',
                  color: dateRange === r ? '#fff' : '#94a3b8',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
            <div style={{ color: k.color, fontSize: '20px', marginBottom: '8px' }}>{k.icon}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{k.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{k.value}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{k.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Contact Growth */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Contact Growth</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={contactGrowth}>
              <defs>
                <linearGradient id="contactGradAn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} fill="url(#contactGradAn)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Performance */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Campaign Performance</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="opened" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicked" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} formatter={(v) => '$' + v.toLocaleString()} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="target" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Traffic Sources</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {trafficSources.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {trafficSources.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Over Time - Full width */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Engagement Over Time</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ l: 'Email Opens', c: '#3b82f6' }, { l: 'Page Views', c: '#10b981' }, { l: 'Form Submits', c: '#f59e0b' }].map(x => (
              <span key={x.l} style={{ fontSize: '12px', color: x.c, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: x.c }} /> {x.l}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="emailOpens" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="formSubmits" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Conversion Funnel</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {funnelData.map((step, i) => {
            const widthPct = 100 - i * 18;
            const convRate = i > 0 ? ((step.value / funnelData[i - 1].value) * 100).toFixed(1) : null;
            return (
              <div key={step.label} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: widthPct + '%', minWidth: '200px', padding: '16px 24px', borderRadius: '8px',
                  background: step.color, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{step.label}</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{step.value.toLocaleString()}</span>
                </div>
                {convRate && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{convRate}% conversion</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
