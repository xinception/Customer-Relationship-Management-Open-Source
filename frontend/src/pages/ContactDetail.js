import React, { useState } from 'react';
import {
  HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineGlobe,
  HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineArrowLeft,
  HiOutlinePencil, HiOutlineSparkles, HiOutlineClock, HiOutlineChatAlt2,
  HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCheckCircle,
  HiOutlineExclamation, HiOutlineLightningBolt, HiOutlineTrendingUp,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const contact = {
  id: 1,
  name: 'Sarah Chen',
  email: 'sarah.chen@techcorp.com',
  phone: '+1 (555) 234-5678',
  company: 'TechCorp Inc.',
  title: 'VP of Engineering',
  website: 'techcorp.com',
  location: 'San Francisco, CA',
  score: 92,
  status: 'Active',
  source: 'Webinar',
  createdAt: 'Mar 15, 2025',
  lastActive: '2 hours ago',
  lifetime_value: '$48,500',
  deals: 3,
  tags: ['Enterprise', 'Hot Lead', 'Decision Maker', 'Product Interest'],
};

const timeline = [
  { id: 1, type: 'email', icon: <HiOutlineMail />, color: '#3b82f6', title: 'Opened "Product Launch Q1" email', time: '2 hours ago', detail: 'Clicked 3 links, spent 4 min reading' },
  { id: 2, type: 'meeting', icon: <HiOutlineChatAlt2 />, color: '#8b5cf6', title: 'Demo call completed', time: '1 day ago', detail: 'Discussed enterprise pricing, follow-up scheduled' },
  { id: 3, type: 'page', icon: <HiOutlineGlobe />, color: '#10b981', title: 'Visited pricing page', time: '1 day ago', detail: 'Viewed Enterprise plan for 6 minutes' },
  { id: 4, type: 'score', icon: <HiOutlineTrendingUp />, color: '#f59e0b', title: 'AI Score updated: 85 → 92', time: '2 days ago', detail: 'Engagement increase detected' },
  { id: 5, type: 'email', icon: <HiOutlineMail />, color: '#3b82f6', title: 'Replied to outreach email', time: '3 days ago', detail: 'Expressed interest in enterprise features' },
  { id: 6, type: 'form', icon: <HiOutlineDocumentText />, color: '#ec4899', title: 'Submitted "Request Demo" form', time: '5 days ago', detail: 'Company size: 500+, Budget: $50k+' },
  { id: 7, type: 'campaign', icon: <HiOutlineLightningBolt />, color: '#f59e0b', title: 'Entered "Welcome Series" automation', time: '1 week ago', detail: 'Step 1/5 completed' },
  { id: 8, type: 'created', icon: <HiOutlineCheckCircle />, color: '#10b981', title: 'Contact created from webinar signup', time: '2 weeks ago', detail: 'Source: "AI in Enterprise" webinar' },
];

const aiInsights = {
  score: 92,
  churnRisk: 8,
  predictedLTV: '$125,000',
  nextBestAction: 'Schedule a personalized demo focusing on enterprise API features. Sarah has viewed the API docs 5 times this week.',
  scoreBreakdown: [
    { label: 'Email Engagement', value: 95 },
    { label: 'Website Activity', value: 88 },
    { label: 'Social Signals', value: 72 },
    { label: 'Firmographic Fit', value: 96 },
    { label: 'Behavioral Score', value: 90 },
  ],
};

const s = {
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: '0', marginBottom: '20px' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '24px', background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', marginBottom: '24px' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', flexShrink: 0 },
  headerInfo: { flex: 1 },
  name: { fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
  badges: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  scoreBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#10b981' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  tabs: { display: 'flex', gap: '0', marginBottom: '24px', background: '#1a2332', borderRadius: '10px', padding: '4px', border: '1px solid #1e3348' },
  tab: { padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s' },
  tabActive: { padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e3348' },
  infoIcon: { color: '#3b82f6', fontSize: '18px', width: '20px' },
  infoLabel: { fontSize: '12px', color: '#64748b', minWidth: '80px' },
  infoValue: { fontSize: '14px', color: '#e2e8f0', fontWeight: 500 },
  tag: { display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', marginRight: '6px', marginBottom: '6px' },
  timelineItem: { display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #1e3348' },
  timelineIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  timelineTitle: { fontSize: '14px', fontWeight: 600, color: '#e2e8f0' },
  timelineDetail: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  timelineTime: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  gaugeContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' },
  breakdownRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' },
  breakdownLabel: { fontSize: '13px', color: '#94a3b8', minWidth: '130px' },
  breakdownBar: { flex: 1, height: '6px', borderRadius: '3px', background: '#1e3348', overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: '3px', background: '#3b82f6' },
  breakdownValue: { fontSize: '13px', fontWeight: 600, color: '#e2e8f0', minWidth: '35px', textAlign: 'right' },
  riskBar: { height: '8px', borderRadius: '4px', background: '#1e3348', overflow: 'hidden', marginTop: '8px' },
  actionCard: { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '16px', marginTop: '16px' },
  actionTitle: { fontSize: '14px', fontWeight: 600, color: '#3b82f6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  actionText: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' },
};

export default function ContactDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'ai', label: 'AI Insights' },
  ];

  const scoreColor = contact.score >= 70 ? '#10b981' : contact.score >= 40 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const scoreOffset = circumference - (contact.score / 100) * circumference;

  return (
    <div className="animate-fade-in">
      <button style={s.backBtn} onClick={() => navigate('/contacts')}>
        <HiOutlineArrowLeft /> Back to Contacts
      </button>

      {/* Header */}
      <div style={s.header}>
        <div style={s.avatar}>
          {contact.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div style={s.headerInfo}>
          <h1 style={s.name}>{contact.name}</h1>
          <div style={s.subtitle}>{contact.title} at {contact.company}</div>
          <div style={s.badges}>
            <span style={s.scoreBadge}>Score: {contact.score}</span>
            <span style={s.statusBadge}>{contact.status}</span>
            <span style={{ ...s.scoreBadge, background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{contact.source}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm"><HiOutlinePencil /> Edit</button>
          <button className="btn btn-primary btn-sm"><HiOutlineMail /> Send Email</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {tabItems.map(t => (
          <button
            key={t.key}
            style={activeTab === t.key ? s.tabActive : s.tab}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>Contact Information</div>
            {[
              { icon: <HiOutlineMail />, label: 'Email', value: contact.email },
              { icon: <HiOutlinePhone />, label: 'Phone', value: contact.phone },
              { icon: <HiOutlineOfficeBuilding />, label: 'Company', value: contact.company },
              { icon: <HiOutlineGlobe />, label: 'Website', value: contact.website },
              { icon: <HiOutlineLocationMarker />, label: 'Location', value: contact.location },
              { icon: <HiOutlineCalendar />, label: 'Created', value: contact.createdAt },
              { icon: <HiOutlineClock />, label: 'Last Active', value: contact.lastActive },
            ].map((item, i) => (
              <div key={i} style={s.infoRow}>
                <span style={s.infoIcon}>{item.icon}</span>
                <span style={s.infoLabel}>{item.label}</span>
                <span style={s.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ ...s.card, marginBottom: '24px' }}>
              <div style={s.cardTitle}>Tags</div>
              <div>
                {contact.tags.map(tag => (
                  <span key={tag} style={s.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Key Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#0f1923', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Lifetime Value</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{contact.lifetime_value}</div>
                </div>
                <div style={{ background: '#0f1923', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Total Deals</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>{contact.deals}</div>
                </div>
                <div style={{ background: '#0f1923', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>AI Score</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{contact.score}</div>
                </div>
                <div style={{ background: '#0f1923', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Churn Risk</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{aiInsights.churnRisk}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div style={s.card}>
          <div style={s.cardTitle}>Activity Timeline</div>
          {timeline.map(event => (
            <div key={event.id} style={s.timelineItem}>
              <div style={{ ...s.timelineIcon, background: event.color + '20', color: event.color }}>
                {event.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.timelineTitle}>{event.title}</div>
                <div style={s.timelineDetail}>{event.detail}</div>
                <div style={s.timelineTime}>{event.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai' && (
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardTitle}>AI Score</div>
            <div style={s.gaugeContainer}>
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1e3348" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700">{aiInsights.score}</text>
                <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="11">out of 100</text>
              </svg>
            </div>
            <div style={{ marginTop: '16px' }}>
              {aiInsights.scoreBreakdown.map(item => (
                <div key={item.label} style={s.breakdownRow}>
                  <span style={s.breakdownLabel}>{item.label}</span>
                  <div style={s.breakdownBar}>
                    <div style={{ ...s.breakdownFill, width: item.value + '%' }} />
                  </div>
                  <span style={s.breakdownValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...s.card, marginBottom: '24px' }}>
              <div style={s.cardTitle}>Churn Risk</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{aiInsights.churnRisk}%</span>
                <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Low Risk</span>
              </div>
              <div style={s.riskBar}>
                <div style={{ height: '100%', borderRadius: '4px', width: aiInsights.churnRisk + '%', background: '#10b981' }} />
              </div>
            </div>
            <div style={{ ...s.card, marginBottom: '24px' }}>
              <div style={s.cardTitle}>Predicted Lifetime Value</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{aiInsights.predictedLTV}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Based on engagement patterns and firmographic data</div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Next Best Action</div>
              <div style={s.actionCard}>
                <div style={s.actionTitle}>
                  <HiOutlineSparkles /> AI Recommendation
                </div>
                <div style={s.actionText}>{aiInsights.nextBestAction}</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                  <HiOutlineCalendar /> Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
