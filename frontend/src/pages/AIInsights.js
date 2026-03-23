import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineSparkles, HiOutlineUserGroup, HiOutlineTrendingUp,
  HiOutlineCurrencyDollar, HiOutlineExclamation, HiOutlineShieldCheck,
  HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineArrowRight,
  HiOutlineSpeakerphone,
} from 'react-icons/hi';

const summaryCards = [
  { icon: <HiOutlineUserGroup />, color: '#3b82f6', label: 'Contacts Scored', value: '4,640', sub: '100% coverage' },
  { icon: <HiOutlineChartBar />, color: '#10b981', label: 'Avg Score', value: '68.4', sub: '+3.2 this month' },
  { icon: <HiOutlineExclamation />, color: '#ef4444', label: 'At-Risk Customers', value: '89', sub: '23 critical' },
  { icon: <HiOutlineCurrencyDollar />, color: '#8b5cf6', label: 'Predicted Revenue', value: '$1.2M', sub: 'Next 90 days' },
];

const scoreDistribution = [
  { range: '0-20', count: 124, color: '#ef4444' },
  { range: '21-40', count: 356, color: '#f59e0b' },
  { range: '41-60', count: 890, color: '#fbbf24' },
  { range: '61-80', count: 1840, color: '#10b981' },
  { range: '81-100', count: 1430, color: '#3b82f6' },
];

const insights = [
  { icon: <HiOutlineExclamation />, color: '#ef4444', type: 'Churn Alert', title: '23 high-value contacts showing disengagement', description: 'These contacts have decreased email engagement by 60% and haven\'t logged in for 14+ days. Combined ARR at risk: $340K.', confidence: 94, action: 'View At-Risk Contacts' },
  { icon: <HiOutlineTrendingUp />, color: '#10b981', type: 'Upsell Opportunity', title: '45 accounts ready for plan upgrade', description: 'These accounts are consistently hitting usage limits and have viewed the pricing page 3+ times. Estimated upsell value: $89K.', confidence: 87, action: 'View Opportunities' },
  { icon: <HiOutlineSpeakerphone />, color: '#3b82f6', type: 'Campaign Suggestion', title: 'Re-engagement campaign recommended', description: 'Best time to send: Tuesday 10 AM. Personalized subject lines could increase open rates by 34% based on historical data.', confidence: 91, action: 'Create Campaign' },
  { icon: <HiOutlineLightningBolt />, color: '#8b5cf6', type: 'Segment Recommendation', title: 'New high-intent segment detected', description: 'AI identified 78 contacts who viewed product demos and pricing within 7 days. This segment has 5x higher conversion probability.', confidence: 85, action: 'Create Segment' },
  { icon: <HiOutlineShieldCheck />, color: '#f59e0b', type: 'Data Quality', title: 'Duplicate contacts detected', description: '34 potential duplicate contact records found based on email similarity and company match. Merging could improve data accuracy.', confidence: 78, action: 'Review Duplicates' },
];

const atRiskContacts = [
  { name: 'Lisa Park', company: 'DesignHub', risk: 87, arr: '$24,000', reason: 'No login 30 days, support tickets up 200%' },
  { name: 'Amanda Torres', company: 'CloudNine', risk: 82, arr: '$36,000', reason: 'Email engagement dropped 75%, cancelled demo' },
  { name: 'Jennifer Adams', company: 'RetailPro', risk: 78, arr: '$18,000', reason: 'Bounced emails, no activity 45 days' },
  { name: 'Thomas Grant', company: 'BuildCo', risk: 71, arr: '$12,000', reason: 'Usage declining 40% month-over-month' },
  { name: 'Robert Lee', company: 'DataStream', risk: 65, arr: '$42,000', reason: 'Competitor evaluation detected, reduced feature usage' },
];

const predictiveData = [
  { month: 'Jan', actual: 72000, predicted: 70000 },
  { month: 'Feb', actual: 76000, predicted: 74000 },
  { month: 'Mar', actual: 84000, predicted: 82000 },
  { month: 'Apr', actual: null, predicted: 88000 },
  { month: 'May', actual: null, predicted: 95000 },
  { month: 'Jun', actual: null, predicted: 102000 },
  { month: 'Jul', actual: null, predicted: 108000 },
  { month: 'Aug', actual: null, predicted: 115000 },
  { month: 'Sep', actual: null, predicted: 122000 },
];

export default function AIInsights() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineSparkles style={{ color: '#8b5cf6' }} /> AI Insights
          </h1>
          <p>AI-powered analytics and recommendations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {summaryCards.map(c => (
          <div key={c.label} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
            <div style={{ color: c.color, fontSize: '20px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{c.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{c.value}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Score Distribution */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Score Distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Predictive Analytics */}
        <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Revenue: Actual vs Predicted</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Actual
              </span>
              <span style={{ fontSize: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> Predicted
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={predictiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #1e3348', borderRadius: '8px', color: '#e2e8f0' }} formatter={(v) => v ? '$' + v.toLocaleString() : 'N/A'} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Feed */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HiOutlineSparkles style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>AI Insights Feed</span>
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>5 insights</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.map((insight, i) => (
            <div key={i} style={{ background: '#0f1923', borderRadius: '10px', padding: '20px', border: '1px solid #1e3348' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: insight.color + '20', color: insight.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {insight.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: insight.color, fontWeight: 600, textTransform: 'uppercase' }}>{insight.type}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{insight.title}</div>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                  {insight.confidence}% confidence
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginLeft: '46px', marginBottom: '12px' }}>{insight.description}</div>
              <div style={{ marginLeft: '46px' }}>
                <button className="btn btn-outline btn-sm">{insight.action} <HiOutlineArrowRight /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Churn Risk */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HiOutlineExclamation style={{ color: '#ef4444' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Top At-Risk Contacts</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {atRiskContacts.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#0f1923', borderRadius: '10px', border: '1px solid #1e3348' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{c.company}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{c.reason}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>ARR</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{c.arr}</div>
              </div>
              <div style={{ width: '120px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Risk</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: c.risk >= 80 ? '#ef4444' : '#f59e0b' }}>{c.risk}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: '#1e3348', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: c.risk + '%', background: c.risk >= 80 ? '#ef4444' : '#f59e0b' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
