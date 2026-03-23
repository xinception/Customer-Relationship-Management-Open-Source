import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineSparkles, HiOutlineTrendingUp, HiOutlineExclamation,
  HiOutlineLightningBolt, HiOutlineUserGroup, HiOutlineSpeakerphone,
  HiOutlineArrowRight, HiOutlineRefresh,
} from 'react-icons/hi';

const businessInsights = [
  {
    id: 1, title: 'Revenue Opportunity Detected',
    desc: '47 contacts in "Trial Ending" segment have engagement scores above 80. Sending a personalized offer could generate an estimated $42,000 in new MRR.',
    priority: 'high', category: 'Revenue', action: 'Create Campaign',
  },
  {
    id: 2, title: 'Churn Risk: Enterprise Accounts',
    desc: '8 enterprise accounts show declining engagement over the last 30 days. Average account value: $2,400/mo. Immediate outreach recommended.',
    priority: 'high', category: 'Retention', action: 'View Accounts',
  },
  {
    id: 3, title: 'Optimal Campaign Timing',
    desc: 'Analysis of 50,000+ email interactions shows your audience is 34% more likely to engage on Tuesdays between 10-11 AM EST.',
    priority: 'medium', category: 'Optimization', action: 'Apply Schedule',
  },
  {
    id: 4, title: 'High-Converting Content Found',
    desc: 'Case study pages generate 5.2x more demo requests than blog posts. Consider increasing case study production and promotion.',
    priority: 'medium', category: 'Content', action: 'View Analysis',
  },
  {
    id: 5, title: 'New Market Segment Emerging',
    desc: 'Healthcare industry contacts have grown 180% in the last quarter with 2x higher conversion rates. Consider creating industry-specific content.',
    priority: 'low', category: 'Growth', action: 'Explore Segment',
  },
  {
    id: 6, title: 'Subject Line Patterns',
    desc: 'Emails with personalized subject lines (using first name) show 28% higher open rates. Only 40% of your campaigns use this pattern.',
    priority: 'medium', category: 'Optimization', action: 'Apply to Campaigns',
  },
];

const predictiveData = [
  { month: 'Jan', actual: 48, predicted: 50 },
  { month: 'Feb', actual: 52, predicted: 53 },
  { month: 'Mar', actual: 58, predicted: 56 },
  { month: 'Apr', actual: null, predicted: 62 },
  { month: 'May', actual: null, predicted: 67 },
  { month: 'Jun', actual: null, predicted: 73 },
];

const segmentRecommendations = [
  { name: 'High-Intent Buyers', criteria: 'Viewed pricing 3+ times AND downloaded whitepaper', estimatedSize: 89, conversionPotential: '12%', revenue: '$28K' },
  { name: 'Champions at Risk', criteria: 'NPS 9-10 AND engagement dropped 40% in 30 days', estimatedSize: 23, conversionPotential: 'N/A', revenue: '$55K at risk' },
  { name: 'Expansion Ready', criteria: 'Usage > 90% of plan AND viewed upgrade page', estimatedSize: 45, conversionPotential: '25%', revenue: '$18K' },
  { name: 'Event Converters', criteria: 'Attended webinar AND visited site within 48 hours', estimatedSize: 134, conversionPotential: '8%', revenue: '$15K' },
];

const campaignOptimizations = [
  { campaign: 'Product Launch Q1', suggestion: 'Resend to non-openers with modified subject', expectedLift: '+15% opens', effort: 'Low' },
  { campaign: 'Welcome Series', suggestion: 'Add personalized product recommendations at step 3', expectedLift: '+22% clicks', effort: 'Medium' },
  { campaign: 'Enterprise Nurture', suggestion: 'Split A/B test on CTA button color and text', expectedLift: '+10% CTR', effort: 'Low' },
  { campaign: 'Re-engagement Flow', suggestion: 'Reduce wait time between emails from 5 to 3 days', expectedLift: '+18% completion', effort: 'Low' },
];

const churnAlerts = [
  { name: 'MegaSoft Inc.', contact: 'David Brown', score: 85, riskLevel: 78, mrr: '$2,400', lastActive: '5 days ago', reason: 'Login frequency dropped 60%' },
  { name: 'CloudNine', contact: 'Amanda Torres', score: 45, riskLevel: 82, mrr: '$1,800', lastActive: '2 weeks ago', reason: 'No email engagement in 30 days' },
  { name: 'RetailPro', contact: 'Jennifer Adams', score: 34, riskLevel: 91, mrr: '$3,200', lastActive: '1 month ago', reason: 'Support tickets + cancellation page visit' },
];

const scoreDistribution = [
  { range: '0-10', count: 45 }, { range: '11-20', count: 78 },
  { range: '21-30', count: 120 }, { range: '31-40', count: 189 },
  { range: '41-50', count: 245 }, { range: '51-60', count: 312 },
  { range: '61-70', count: 398 }, { range: '71-80', count: 456 },
  { range: '81-90', count: 380 }, { range: '91-100', count: 197 },
];

export default function AIInsights() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Revenue', 'Retention', 'Optimization', 'Content', 'Growth'];

  const filteredInsights = activeCategory === 'All'
    ? businessInsights
    : businessInsights.filter((i) => i.category === activeCategory);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineSparkles style={{ color: 'var(--purple)' }} /> AI Insights
          </h1>
          <p>AI-powered recommendations and predictive analytics</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm"><HiOutlineRefresh /> Refresh Analysis</button>
          <button className="btn btn-primary btn-sm"><HiOutlineSparkles /> Generate Report</button>
        </div>
      </div>

      {/* Business Insights */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Business Insights</div>
          <div className="filter-pills">
            {categories.map((c) => (
              <button key={c} className={`filter-pill ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
          {filteredInsights.map((insight) => (
            <div key={insight.id} className={`insight-card ${insight.priority}`}>
              <div className="insight-header">
                <div className="insight-title">{insight.title}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${insight.priority === 'high' ? 'badge-red' : insight.priority === 'medium' ? 'badge-yellow' : 'badge-blue'}`}>
                    {insight.priority}
                  </span>
                  <span className="badge badge-gray">{insight.category}</span>
                </div>
              </div>
              <div className="insight-body">{insight.desc}</div>
              <div className="insight-action">
                <button className="btn btn-primary btn-sm">{insight.action} <HiOutlineArrowRight /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {/* Predictive Analytics */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Predictive Revenue Forecast</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Actual vs AI Predicted ($K)</div>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} /> Actual</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6' }} /> Predicted</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={predictiveData}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(v) => v ? `$${v}K` : 'N/A'} />
              <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">AI Score Distribution</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Contact scoring histogram</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3348" />
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreDistribution.map((entry, i) => {
                  const val = parseInt(entry.range.split('-')[1]);
                  const color = val <= 30 ? '#ef4444' : val <= 60 ? '#f59e0b' : '#10b981';
                  return <Bar key={i} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Low (0-30)</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Medium (31-60)</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> High (61-100)</span>
          </div>
        </div>

        {/* Segment Recommendations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineUserGroup style={{ color: 'var(--primary)' }} />
              <div className="card-title">AI Segment Recommendations</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {segmentRecommendations.map((seg, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{seg.name}</div>
                  <button className="btn btn-outline btn-sm">Create</button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{seg.criteria}</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Size: </span>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{seg.estimatedSize}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conv: </span>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--success)' }}>{seg.conversionPotential}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Value: </span>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>{seg.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Optimizations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineSpeakerphone style={{ color: 'var(--warning)' }} />
              <div className="card-title">Campaign Optimization Suggestions</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaignOptimizations.map((opt, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>{opt.campaign}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-green">{opt.expectedLift}</span>
                    <span className={`badge ${opt.effort === 'Low' ? 'badge-blue' : 'badge-yellow'}`}>{opt.effort} effort</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{opt.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Alerts */}
        <div className="card full-width" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineExclamation style={{ color: 'var(--danger)' }} />
              <div className="card-title">Churn Risk Alerts</div>
            </div>
            <span className="badge badge-red">{churnAlerts.length} accounts at risk</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>AI Score</th>
                  <th>Churn Risk</th>
                  <th>MRR at Risk</th>
                  <th>Last Active</th>
                  <th>Risk Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {churnAlerts.map((alert, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{alert.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{alert.contact}</td>
                    <td>
                      <span className={`score-badge ${alert.score >= 70 ? 'score-high' : alert.score >= 40 ? 'score-medium' : 'score-low'}`}>
                        {alert.score}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill red" style={{ width: `${alert.riskLevel}%` }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '13px' }}>{alert.riskLevel}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--warning)' }}>{alert.mrr}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{alert.lastActive}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{alert.reason}</td>
                    <td>
                      <button className="btn btn-primary btn-sm">Intervene</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
