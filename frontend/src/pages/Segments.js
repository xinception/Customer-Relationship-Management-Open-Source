import React, { useState } from 'react';
import {
  HiOutlinePlus, HiOutlineUserGroup, HiOutlineSparkles,
  HiOutlineRefresh, HiOutlineChip, HiOutlineFilter,
  HiOutlineTrash, HiOutlineLightningBolt,
} from 'react-icons/hi';

const segments = [
  { id: 1, name: 'High-Value Enterprise', type: 'dynamic', contactCount: 342, lastUpdated: '2 hours ago', description: 'Enterprise contacts with LTV > $10k and engagement score > 70', color: '#3b82f6' },
  { id: 2, name: 'At-Risk Customers', type: 'ai-predicted', contactCount: 89, lastUpdated: '1 hour ago', description: 'AI-identified contacts showing churn signals in the last 30 days', color: '#ef4444' },
  { id: 3, name: 'Webinar Attendees 2026', type: 'static', contactCount: 567, lastUpdated: '3 days ago', description: 'All contacts who attended any webinar in 2026', color: '#10b981' },
  { id: 4, name: 'Product-Qualified Leads', type: 'dynamic', contactCount: 234, lastUpdated: '30 min ago', description: 'Trial users who completed onboarding and used 3+ features', color: '#f59e0b' },
  { id: 5, name: 'Newsletter Engaged', type: 'dynamic', contactCount: 1245, lastUpdated: '1 day ago', description: 'Contacts who opened 3+ newsletters in the last 90 days', color: '#8b5cf6' },
  { id: 6, name: 'Upsell Candidates', type: 'ai-predicted', contactCount: 156, lastUpdated: '4 hours ago', description: 'AI-predicted contacts most likely to upgrade their plan', color: '#ec4899' },
];

const aiSuggestedSegments = [
  { name: 'Feature Power Users', description: 'Contacts using advanced features 5x more than average. 78 contacts identified.', confidence: 92 },
  { name: 'Pricing Page Visitors', description: 'Contacts who visited pricing 3+ times without converting. 45 contacts identified.', confidence: 87 },
  { name: 'Re-activation Candidates', description: 'Inactive contacts with high historical engagement. 134 contacts identified.', confidence: 81 },
];

const getTypeBadge = (type) => {
  const map = {
    static: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Static' },
    dynamic: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Dynamic' },
    'ai-predicted': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', label: 'AI Predicted' },
  };
  return map[type] || map.static;
};

export default function Segments() {
  const [conditions, setConditions] = useState([
    { id: 1, field: 'engagement_score', operator: 'greater_than', value: '70' },
    { id: 2, field: 'company_size', operator: 'equals', value: 'Enterprise' },
  ]);
  const [conditionLogic, setConditionLogic] = useState('AND');

  const fields = ['engagement_score', 'company_size', 'last_active', 'email_opens', 'deal_value', 'tags', 'source', 'location'];
  const operators = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'starts_with'];

  const addCondition = () => {
    setConditions([...conditions, { id: Date.now(), field: 'engagement_score', operator: 'equals', value: '' }]);
  };

  const removeCondition = (id) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Segments</h1>
          <p>Organize contacts into targeted groups</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm"><HiOutlinePlus /> Create Segment</button>
        </div>
      </div>

      {/* Segment Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {segments.map(seg => {
          const typeBadge = getTypeBadge(seg.type);
          return (
            <div key={seg.id} style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s', borderLeft: '3px solid ' + seg.color }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e3348'; e.currentTarget.style.borderLeft = '3px solid ' + seg.color; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{seg.name}</div>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: typeBadge.bg, color: typeBadge.color }}>
                  {typeBadge.label}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>{seg.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineUserGroup style={{ color: '#64748b', fontSize: '14px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{seg.contactCount.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>contacts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineRefresh style={{ color: '#64748b', fontSize: '12px' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{seg.lastUpdated}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segment Builder */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HiOutlineFilter style={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Segment Builder</span>
        </div>

        {/* Logic Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Match</span>
          <div style={{ display: 'flex', background: '#0f1923', borderRadius: '8px', padding: '3px', border: '1px solid #1e3348' }}>
            {['AND', 'OR'].map(logic => (
              <button key={logic} onClick={() => setConditionLogic(logic)}
                style={{
                  padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  background: conditionLogic === logic ? '#3b82f6' : 'transparent',
                  color: conditionLogic === logic ? '#fff' : '#64748b',
                }}
              >
                {logic}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>of the following conditions</span>
        </div>

        {/* Condition Rows */}
        {conditions.map((cond, i) => (
          <div key={cond.id}>
            {i > 0 && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 12px', borderRadius: '4px' }}>{conditionLogic}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select value={cond.field} onChange={e => { const updated = [...conditions]; updated[i].field = e.target.value; setConditions(updated); }}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e3348', background: '#0f1923', color: '#e2e8f0', fontSize: '13px' }}>
                {fields.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
              <select value={cond.operator} onChange={e => { const updated = [...conditions]; updated[i].operator = e.target.value; setConditions(updated); }}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e3348', background: '#0f1923', color: '#e2e8f0', fontSize: '13px' }}>
                {operators.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
              <input value={cond.value} onChange={e => { const updated = [...conditions]; updated[i].value = e.target.value; setConditions(updated); }}
                placeholder="Value..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e3348', background: '#0f1923', color: '#e2e8f0', fontSize: '13px' }} />
              <button onClick={() => removeCondition(cond.id)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #1e3348', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <HiOutlineTrash />
              </button>
            </div>
          </div>
        ))}

        <button onClick={addCondition}
          style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', border: '1px dashed #1e3348', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HiOutlinePlus /> Add Condition
        </button>
      </div>

      {/* AI Suggested Segments */}
      <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HiOutlineSparkles style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>AI Suggested Segments</span>
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', marginLeft: '8px' }}>3 new</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {aiSuggestedSegments.map(seg => (
            <div key={seg.name} style={{ background: '#0f1923', borderRadius: '10px', padding: '20px', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{seg.name}</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa' }}>{seg.confidence}%</span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>{seg.description}</div>
              <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <HiOutlineLightningBolt /> Create Segment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
