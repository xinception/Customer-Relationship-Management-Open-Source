import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineArrowLeft, HiOutlineMail, HiOutlineCursorClick,
  HiOutlineEye, HiOutlineCheckCircle, HiOutlineTrendingUp,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const campaign = {
  name: 'Product Launch Q1 2026',
  status: 'Active',
  type: 'Email',
  startDate: 'Mar 1, 2026',
  endDate: 'Mar 31, 2026',
  sent: 4500,
  delivered: 4410,
  opened: 2835,
  clicked: 980,
  converted: 145,
  deliveryRate: 98,
  openRate: 63,
  clickRate: 21.8,
  conversionRate: 3.2,
};

const performanceData = [
  { date: 'Mar 1', opens: 320, clicks: 95, conversions: 12 },
  { date: 'Mar 4', opens: 480, clicks: 150, conversions: 22 },
  { date: 'Mar 7', opens: 410, clicks: 128, conversions: 18 },
  { date: 'Mar 10', opens: 350, clicks: 105, conversions: 15 },
  { date: 'Mar 13', opens: 290, clicks: 88, conversions: 14 },
  { date: 'Mar 16', opens: 380, clicks: 120, conversions: 20 },
  { date: 'Mar 19', opens: 420, clicks: 135, conversions: 24 },
  { date: 'Mar 22', opens: 185, clicks: 59, conversions: 10 },
];

const abTestResults = [
  { variant: 'A', subject: 'Introducing Our Latest Innovation', openRate: 58, clickRate: 19, conversionRate: 2.8, sent: 2250 },
  { variant: 'B', subject: 'You Won\'t Want to Miss This Launch', openRate: 68, clickRate: 24.6, conversionRate: 3.6, sent: 2250, winner: true },
];

const audienceSegments = [
  { name: 'Enterprise Decision Makers', count: 1200, percentage: 27 },
  { name: 'Active Trial Users', count: 1800, percentage: 40 },
  { name: 'Engaged Newsletter Subscribers', count: 950, percentage: 21 },
  { name: 'Webinar Attendees', count: 550, percentage: 12 },
];

export default function CampaignDetail() {
  const navigate = useNavigate();

  const metricItems = [
    { label: 'Sent', value: campaign.sent.toLocaleString(), pct: null, color: '#3b82f6', icon: <HiOutlineMail /> },
    { label: 'Delivered', value: campaign.delivered.toLocaleString(), pct: campaign.deliveryRate + '%', color: '#8b5cf6', icon: <HiOutlineCheckCircle /> },
    { label: 'Opened', value: campaign.opened.toLocaleString(), pct: campaign.openRate + '%', color: '#10b981', icon: <HiOutlineEye /> },
    { label: 'Clicked', value: campaign.clicked.toLocaleString(), pct: campaign.clickRate + '%', color: '#f59e0b', icon: <HiOutlineCursorClick /> },
    { label: 'Converted', value: campaign.converted.toLocaleString(), pct: campaign.conversionRate + '%', color: '#ec4899', icon: <HiOutlineTrendingUp /> },
  ];

  return (
    <div className="animate-fade-in">
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: '0', marginBottom: '20px' }} onClick={() => navigate('/campaigns')}>
        <HiOutlineArrowLeft /> Back to Campaigns
      </button>

      {/* Header */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>{campaign.name}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{campaign.status}</span>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{campaign.type}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>{campaign.startDate} — {campaign.endDate}</div>
          </div>
          <button className="btn btn-outline btn-sm"><HiOutlineMail /> Duplicate</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {metricItems.map(m => (
          <div key={m.label} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', textAlign: 'center' }}>
            <div style={{ color: m.color, fontSize: '22px', marginBottom: '8px' }}>{m.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{m.label}</div>
            {m.pct && <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: m.color }}>{m.pct}</div>}
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Performance Over Time</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ label: 'Opens', color: '#10b981' }, { label: 'Clicks', color: '#f59e0b' }, { label: 'Conversions', color: '#ec4899' }].map(l => (
              <span key={l.label} style={{ fontSize: '12px', color: l.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} /> {l.label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="conversions" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* A/B Test Results */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>A/B Test Results</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {abTestResults.map(v => (
            <div key={v.variant} style={{ background: '#0f1923', borderRadius: '10px', padding: '20px', position: 'relative', border: v.winner ? '1px solid rgba(16,185,129,0.3)' : '1px solid #1e3348' }}>
              {v.winner && <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>Winner</div>}
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>Variant {v.variant}</div>
              <div style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '16px', fontStyle: 'italic' }}>"{v.subject}"</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { val: v.openRate + '%', lbl: 'Open Rate' },
                  { val: v.clickRate + '%', lbl: 'Click Rate' },
                  { val: v.conversionRate + '%', lbl: 'Conv. Rate' },
                ].map(m => (
                  <div key={m.lbl}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{m.val}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{m.lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>Sent to {v.sent.toLocaleString()} contacts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Segments */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <HiOutlineUserGroup style={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Audience Segments</span>
        </div>
        {audienceSegments.map(seg => (
          <div key={seg.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1e3348' }}>
            <span style={{ fontSize: '14px', color: '#e2e8f0', minWidth: '240px' }}>{seg.name}</span>
            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#1e3348', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: '#3b82f6', width: seg.percentage + '%' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>{seg.count.toLocaleString()} ({seg.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
