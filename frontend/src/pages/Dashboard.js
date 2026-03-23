import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  HiOutlineUserGroup, HiOutlineSpeakerphone, HiOutlineTrendingUp,
  HiOutlineCurrencyDollar, HiOutlineSparkles, HiOutlineMail,
  HiOutlineUserAdd, HiOutlineCheckCircle, HiOutlineLightningBolt,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const contactGrowth = [
  { month: 'Jul', contacts: 1200 }, { month: 'Aug', contacts: 1450 },
  { month: 'Sep', contacts: 1680 }, { month: 'Oct', contacts: 1890 },
  { month: 'Nov', contacts: 2150 }, { month: 'Dec', contacts: 2420 },
];

const campaignPerformance = [
  { name: 'Welcome Series', sent: 4500, opened: 2800, clicked: 980 },
  { name: 'Product Launch', sent: 3200, opened: 2100, clicked: 750 },
  { name: 'Re-engage', sent: 2800, opened: 1400, clicked: 420 },
  { name: 'Newsletter', sent: 5100, opened: 3200, clicked: 1100 },
  { name: 'Promo Q4', sent: 3800, opened: 2500, clicked: 890 },
];

const revenueData = [
  { month: 'Jul', revenue: 42000, target: 40000 },
  { month: 'Aug', revenue: 48000, target: 45000 },
  { month: 'Sep', revenue: 51000, target: 48000 },
  { month: 'Oct', revenue: 55000, target: 52000 },
  { month: 'Nov', revenue: 62000, target: 58000 },
  { month: 'Dec', revenue: 71000, target: 65000 },
];

const engagementFunnel = [
  { name: 'Emails Sent', value: 15400, color: '#3b82f6' },
  { name: 'Delivered', value: 14800, color: '#6366f1' },
  { name: 'Opened', value: 8200, color: '#8b5cf6' },
  { name: 'Clicked', value: 3140, color: '#ec4899' },
  { name: 'Converted', value: 890, color: '#10b981' },
];

const recentActivity = [
  { icon: <HiOutlineUserAdd />, color: 'var(--primary-light)', iconColor: 'var(--primary)', text: '<strong>Sarah Chen</strong> was added to segment "High-Value Prospects"', time: '2 min ago' },
  { icon: <HiOutlineMail />, color: 'var(--success-light)', iconColor: 'var(--success)', text: 'Campaign <strong>"Product Launch Q1"</strong> sent to 3,200 contacts', time: '15 min ago' },
  { icon: <HiOutlineCheckCircle />, color: 'var(--purple-light)', iconColor: 'var(--purple)', text: '<strong>Mike Johnson</strong> converted - Deal value $12,500', time: '32 min ago' },
  { icon: <HiOutlineLightningBolt />, color: 'var(--warning-light)', iconColor: 'var(--warning)', text: 'Automation <strong>"Welcome Series"</strong> triggered for 45 new contacts', time: '1 hr ago' },
  { icon: <HiOutlineSparkles />, color: 'var(--pink-light)', iconColor: 'var(--pink)', text: 'AI detected <strong>23 contacts</strong> at risk of churning', time: '2 hr ago' },
  { icon: <HiOutlineTrendingUp />, color: 'var(--info-light)', iconColor: 'var(--info)', text: 'Engagement score increased by <strong>12%</strong> this week', time: '3 hr ago' },
];

const aiInsights = [
  { title: 'Optimal Send Time', desc: 'Tuesday 10 AM shows 34% higher open rates for your audience.', priority: 'high', action: 'Apply to campaigns' },
  { title: 'Churn Risk Alert', desc: '23 high-value contacts showing decreased engagement. Consider re-engagement campaign.', priority: 'high', action: 'View contacts' },
  { title: 'Segment Opportunity', desc: 'Contacts who viewed pricing page 3+ times have 5x conversion rate.', priority: 'medium', action: 'Create segment' },
  { title: 'Campaign A/B Insight', desc: 'Subject lines with personalization perform 28% better in your campaigns.', priority: 'low', action: 'Learn more' },
];

const pieData = [
  { name: 'Email', value: 45, color: '#3b82f6' },
  { name: 'Social', value: 25, color: '#8b5cf6' },
  { name: 'Organic', value: 18, color: '#10b981' },
  { name: 'Referral', value: 12, color: '#f59e0b' },
];

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, John. Here's your CRM overview.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm">
            Last 30 Days
          </button>
          <button className="btn btn-primary btn-sm">
            <HiOutlineSparkles /> AI Summary
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid stagger">
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><HiOutlineUserGroup /></div>
          <div className="kpi-label">Total Contacts</div>
          <div className="kpi-value">2,420</div>
          <span className="kpi-change positive">+12.5% from last month</span>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green"><HiOutlineSpeakerphone /></div>
          <div className="kpi-label">Active Campaigns</div>
          <div className="kpi-value">12</div>
          <span className="kpi-change positive">+3 new this week</span>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple"><HiOutlineTrendingUp /></div>
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value">5.8%</div>
          <span className="kpi-change positive">+0.8% from last month</span>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange"><HiOutlineCurrencyDollar /></div>
          <div className="kpi-label">Revenue (MTD)</div>
          <div className="kpi-value">$71K</div>
          <span className="kpi-change positive">+18.2% from last month</span>
        </div>
        <div className="kpi-card pink">
          <div className="kpi-icon pink"><HiOutlineSparkles /></div>
          <div className="kpi-label">AI Score Avg</div>
          <div className="kpi-value">74</div>
          <span className="kpi-change positive">+5 points</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Contact Growth</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={contactGrowth}>
              <defs>
                <linearGradient id="contactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} fill="url(#contactGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Campaign Performance</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Top 5 campaigns</div>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} /> Sent</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> Opened</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Clicked</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opened" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Revenue vs Target</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Monthly comparison</div>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> Revenue</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#64748b' }} /> Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              <Line type="monotone" dataKey="target" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Traffic Sources</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Contact acquisition</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Funnel */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-header">
          <div className="chart-title">Engagement Funnel</div>
        </div>
        <div className="funnel">
          {engagementFunnel.map((step, i) => (
            <div
              key={step.name}
              className="funnel-step"
              style={{
                background: step.color,
                width: `${100 - i * 15}%`,
                minWidth: '200px',
              }}
            >
              <span className="funnel-label">{step.name}</span>
              <span className="funnel-value">{step.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity & AI Insights */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Recent Activity</div>
            <button className="btn btn-outline btn-sm">View All</button>
          </div>
          <div className="activity-feed">
            {recentActivity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: item.color, color: item.iconColor }}>
                  {item.icon}
                </div>
                <div className="activity-content">
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineSparkles style={{ color: 'var(--purple)' }} />
              <div className="chart-title">AI Insights</div>
            </div>
            <span className="badge badge-purple">4 new</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiInsights.map((insight, i) => (
              <div key={i} className={`insight-card ${insight.priority}`}>
                <div className="insight-header">
                  <div className="insight-title">{insight.title}</div>
                  <span className={`badge ${insight.priority === 'high' ? 'badge-red' : insight.priority === 'medium' ? 'badge-yellow' : 'badge-blue'}`}>
                    {insight.priority}
                  </span>
                </div>
                <div className="insight-body">{insight.desc}</div>
                <div className="insight-action">
                  <button className="btn btn-outline btn-sm">
                    {insight.action} <HiOutlineArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary"><HiOutlineUserAdd /> Add Contact</button>
          <button className="btn btn-secondary"><HiOutlineSpeakerphone /> New Campaign</button>
          <button className="btn btn-secondary"><HiOutlineCollection /> Create Segment</button>
          <button className="btn btn-secondary"><HiOutlineLightningBolt /> Build Automation</button>
          <button className="btn btn-secondary"><HiOutlineSparkles /> AI Analysis</button>
        </div>
      </div>
    </div>
  );
}
