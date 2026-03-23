import React, { useState } from 'react';
import {
  HiOutlinePlus, HiOutlineLightningBolt, HiOutlineMail,
  HiOutlineClock, HiOutlineQuestionMarkCircle, HiOutlineCog,
  HiOutlinePlay, HiOutlinePause, HiOutlineChevronRight,
} from 'react-icons/hi';

const workflows = [
  {
    id: 1, name: 'Welcome Series', status: 'active', trigger: 'New contact created', stepsCount: 5, entered: 1245, completed: 892, conversionRate: 71.6,
    steps: [
      { type: 'trigger', name: 'New Contact Created', config: 'When a new contact is added to the CRM', color: '#10b981' },
      { type: 'email', name: 'Welcome Email', config: 'Send personalized welcome email with onboarding guide', color: '#3b82f6' },
      { type: 'wait', name: 'Wait 2 Days', config: 'Pause workflow for 48 hours', color: '#64748b' },
      { type: 'condition', name: 'Opened Welcome Email?', config: 'Check if contact opened the welcome email', color: '#f59e0b' },
      { type: 'email', name: 'Follow-up Email', config: 'Send feature highlights or re-engagement email', color: '#3b82f6' },
    ],
  },
  {
    id: 2, name: 'Lead Scoring Update', status: 'active', trigger: 'Page visit or email open', stepsCount: 4, entered: 3420, completed: 3420, conversionRate: 100,
    steps: [
      { type: 'trigger', name: 'Engagement Detected', config: 'Page visit, email open, or form submission', color: '#10b981' },
      { type: 'action', name: 'Update Score', config: 'Recalculate AI engagement score', color: '#8b5cf6' },
      { type: 'condition', name: 'Score > 80?', config: 'Check if score exceeds threshold', color: '#f59e0b' },
      { type: 'action', name: 'Notify Sales', config: 'Send Slack notification to sales team', color: '#8b5cf6' },
    ],
  },
  {
    id: 3, name: 'Re-engagement Campaign', status: 'paused', trigger: '30 days inactive', stepsCount: 6, entered: 567, completed: 234, conversionRate: 41.3,
    steps: [
      { type: 'trigger', name: '30 Days Inactive', config: 'Contact has not engaged in 30 days', color: '#10b981' },
      { type: 'email', name: 'We Miss You', config: 'Send re-engagement email with special offer', color: '#3b82f6' },
      { type: 'wait', name: 'Wait 3 Days', config: 'Pause workflow for 72 hours', color: '#64748b' },
      { type: 'condition', name: 'Re-engaged?', config: 'Check if contact opened email or visited site', color: '#f59e0b' },
      { type: 'email', name: 'Last Chance', config: 'Send final re-engagement attempt', color: '#3b82f6' },
      { type: 'action', name: 'Mark Churned', config: 'Update contact status to churned', color: '#8b5cf6' },
    ],
  },
  {
    id: 4, name: 'Post-Purchase Follow-up', status: 'active', trigger: 'Deal closed won', stepsCount: 4, entered: 189, completed: 156, conversionRate: 82.5,
    steps: [
      { type: 'trigger', name: 'Deal Closed Won', config: 'When a deal is marked as won', color: '#10b981' },
      { type: 'email', name: 'Thank You', config: 'Send thank you email with next steps', color: '#3b82f6' },
      { type: 'wait', name: 'Wait 7 Days', config: 'Pause workflow for 7 days', color: '#64748b' },
      { type: 'email', name: 'NPS Survey', config: 'Send customer satisfaction survey', color: '#3b82f6' },
    ],
  },
  {
    id: 5, name: 'Event Reminder Series', status: 'draft', trigger: 'Registered for event', stepsCount: 3, entered: 0, completed: 0, conversionRate: 0,
    steps: [
      { type: 'trigger', name: 'Event Registration', config: 'Contact registers for an upcoming event', color: '#10b981' },
      { type: 'wait', name: 'Wait Until 1 Day Before', config: 'Pause until 24 hours before event', color: '#64748b' },
      { type: 'email', name: 'Event Reminder', config: 'Send reminder with event details and link', color: '#3b82f6' },
    ],
  },
];

const getStatusStyle = (status) => {
  const map = {
    active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Active' },
    paused: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Paused' },
    draft: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Draft' },
  };
  return map[status] || map.draft;
};

const getStepIcon = (type) => {
  const map = {
    trigger: <HiOutlineLightningBolt />,
    email: <HiOutlineMail />,
    wait: <HiOutlineClock />,
    condition: <HiOutlineQuestionMarkCircle />,
    action: <HiOutlineCog />,
  };
  return map[type] || <HiOutlineCog />;
};

export default function Automation() {
  const [selectedId, setSelectedId] = useState(1);
  const selected = workflows.find(w => w.id === selectedId);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Automation</h1>
          <p>Build and manage marketing automation workflows</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm"><HiOutlinePlus /> New Workflow</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Workflow List */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workflows ({workflows.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workflows.map(w => {
              const statusStyle = getStatusStyle(w.status);
              const isSelected = w.id === selectedId;
              return (
                <div key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  style={{
                    background: '#1a2332', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid #1e3348',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{w.name}</div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineLightningBolt style={{ fontSize: '12px' }} /> {w.trigger}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <span style={{ color: '#94a3b8' }}><strong style={{ color: '#e2e8f0' }}>{w.stepsCount}</strong> steps</span>
                    <span style={{ color: '#94a3b8' }}><strong style={{ color: '#e2e8f0' }}>{w.entered.toLocaleString()}</strong> entered</span>
                    <span style={{ color: '#94a3b8' }}><strong style={{ color: '#e2e8f0' }}>{w.completed.toLocaleString()}</strong> completed</span>
                    {w.conversionRate > 0 && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{w.conversionRate}% conversion</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Workflow Detail */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workflow Steps</div>
          <div style={{ background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>{selected.name}</div>
              {selected.status === 'active' ? (
                <button className="btn btn-outline btn-sm"><HiOutlinePause /> Pause</button>
              ) : (
                <button className="btn btn-primary btn-sm"><HiOutlinePlay /> Activate</button>
              )}
            </div>

            {/* Steps Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {selected.steps.map((step, i) => (
                <div key={i}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px',
                    background: '#0f1923', borderRadius: '10px', border: '1px solid #1e3348',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0, background: step.color + '20', color: step.color,
                    }}>
                      {getStepIcon(step.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{step.name}</span>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{step.type}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{step.config}</div>
                    </div>
                  </div>
                  {i < selected.steps.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <div style={{ width: '2px', height: '24px', background: '#1e3348', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', width: '8px', height: '8px', borderLeft: '2px solid #3b82f6', borderBottom: '2px solid #3b82f6', transform: 'rotate(-45deg)' }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
