import React, { useState } from 'react';
import {
  HiOutlineUser, HiOutlineMail, HiOutlineKey,
  HiOutlinePuzzle, HiOutlineSparkles, HiOutlineSave,
  HiOutlineClipboardCopy, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const initialProfile = {
  firstName: 'John',
  lastName: 'Anderson',
  email: 'john.anderson@company.com',
  role: 'Admin',
  timezone: 'America/Los_Angeles',
};

const initialEmail = {
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: '587',
  fromName: 'John Anderson',
  fromEmail: 'marketing@company.com',
  replyTo: 'reply@company.com',
};

const apiKeys = [
  { id: 1, name: 'Production API Key', key: 'crm_live_sk_4f8a2b...d9e1', created: 'Jan 15, 2026', lastUsed: '2 hours ago', status: 'active' },
  { id: 2, name: 'Development API Key', key: 'crm_test_sk_7c3d1e...f5a2', created: 'Feb 20, 2026', lastUsed: '3 days ago', status: 'active' },
  { id: 3, name: 'Webhook Secret', key: 'crm_whsec_9b2f4a...c8d3', created: 'Mar 1, 2026', lastUsed: '1 day ago', status: 'active' },
];

const integrations = [
  { name: 'Slack', description: 'Send notifications and alerts to Slack channels', connected: true, icon: '#4A154B' },
  { name: 'Salesforce', description: 'Sync contacts and deals with Salesforce CRM', connected: true, icon: '#00A1E0' },
  { name: 'Zapier', description: 'Connect with 5,000+ apps via Zapier automations', connected: false, icon: '#FF4A00' },
  { name: 'HubSpot', description: 'Import contacts and campaigns from HubSpot', connected: false, icon: '#FF7A59' },
  { name: 'Google Analytics', description: 'Track website events and attribution data', connected: true, icon: '#E37400' },
  { name: 'Stripe', description: 'Sync payment and subscription data', connected: true, icon: '#635BFF' },
];

export default function Settings() {
  const [profile, setProfile] = useState(initialProfile);
  const [emailConfig, setEmailConfig] = useState(initialEmail);
  const [showKeys, setShowKeys] = useState({});
  const [aiSettings, setAiSettings] = useState({
    autoScoring: true,
    autoSegmentation: true,
    sendTimeOptimization: true,
    churnPrediction: true,
    contentSuggestions: false,
    leadEnrichment: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleKey = (id) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e3348', background: '#0f1923', color: '#e2e8f0', fontSize: '14px', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 };
  const sectionStyle = { background: '#1a2332', borderRadius: '12px', border: '1px solid #1e3348', padding: '24px', marginBottom: '24px' };
  const sectionTitle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' };
  const toggleContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e3348' };

  const Toggle = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
      background: checked ? '#3b82f6' : '#1e3348',
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', transition: 'left 0.2s',
        left: checked ? '23px' : '3px',
      }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your account and application settings</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            {saved ? <><HiOutlineCheckCircle /> Saved!</> : <><HiOutlineSave /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><HiOutlineUser style={{ color: '#3b82f6' }} /> Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <input style={{ ...inputStyle, background: '#1a2332', color: '#64748b' }} value={profile.role} disabled />
          </div>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select style={inputStyle} value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">GMT</option>
              <option value="Europe/Berlin">CET</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><HiOutlineMail style={{ color: '#10b981' }} /> Email Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>SMTP Host</label>
            <input style={inputStyle} value={emailConfig.smtpHost} onChange={e => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>SMTP Port</label>
            <input style={inputStyle} value={emailConfig.smtpPort} onChange={e => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>From Name</label>
            <input style={inputStyle} value={emailConfig.fromName} onChange={e => setEmailConfig({ ...emailConfig, fromName: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>From Email</label>
            <input style={inputStyle} value={emailConfig.fromEmail} onChange={e => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Reply-To Email</label>
            <input style={inputStyle} value={emailConfig.replyTo} onChange={e => setEmailConfig({ ...emailConfig, replyTo: e.target.value })} />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={sectionTitle}><HiOutlineKey style={{ color: '#f59e0b' }} /> API Keys</div>
          <button className="btn btn-outline btn-sm">Generate New Key</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apiKeys.map(k => (
            <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#0f1923', borderRadius: '10px', border: '1px solid #1e3348' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{k.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Created: {k.created} | Last used: {k.lastUsed}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '13px', color: '#94a3b8', background: '#1a2332', padding: '6px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {showKeys[k.id] ? k.key.replace('...', 'x8f2a1b3') : k.key}
                </code>
                <button onClick={() => toggleKey(k.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                  {showKeys[k.id] ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
                <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                  <HiOutlineClipboardCopy />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><HiOutlinePuzzle style={{ color: '#8b5cf6' }} /> Integrations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {integrations.map(int => (
            <div key={int.name} style={{ background: '#0f1923', borderRadius: '10px', padding: '20px', border: '1px solid #1e3348' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: int.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {int.name[0]}
                </div>
                {int.connected ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    <HiOutlineCheckCircle /> Connected
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Not connected</span>
                )}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{int.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '12px' }}>{int.description}</div>
              <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                {int.connected ? 'Configure' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><HiOutlineSparkles style={{ color: '#ec4899' }} /> AI Settings</div>
        {[
          { key: 'autoScoring', label: 'Auto Scoring', desc: 'Automatically calculate and update AI engagement scores for all contacts' },
          { key: 'autoSegmentation', label: 'Auto Segmentation', desc: 'AI automatically creates and updates segments based on behavioral patterns' },
          { key: 'sendTimeOptimization', label: 'Send Time Optimization', desc: 'AI determines the optimal time to send emails for each contact' },
          { key: 'churnPrediction', label: 'Churn Prediction', desc: 'Predict which customers are at risk of churning based on engagement data' },
          { key: 'contentSuggestions', label: 'Content Suggestions', desc: 'AI suggests email subject lines and content based on audience analysis' },
          { key: 'leadEnrichment', label: 'Lead Enrichment', desc: 'Automatically enrich contact profiles with publicly available data' },
        ].map(setting => (
          <div key={setting.key} style={toggleContainer}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{setting.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{setting.desc}</div>
            </div>
            <Toggle
              checked={aiSettings[setting.key]}
              onChange={() => setAiSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
