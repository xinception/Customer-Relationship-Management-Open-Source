import React, { useState } from 'react';
import {
  HiOutlineCog, HiOutlineKey, HiOutlineGlobe, HiOutlineMail,
  HiOutlineBell, HiOutlineDatabase, HiOutlineShieldCheck,
  HiOutlineColorSwatch, HiOutlineSave,
} from 'react-icons/hi';

const integrations = [
  { name: 'Mailgun', category: 'Email', status: 'Connected', icon: '📧' },
  { name: 'Stripe', category: 'Payments', status: 'Connected', icon: '💳' },
  { name: 'Slack', category: 'Notifications', status: 'Connected', icon: '💬' },
  { name: 'Google Analytics', category: 'Analytics', status: 'Disconnected', icon: '📊' },
  { name: 'Salesforce', category: 'CRM Sync', status: 'Disconnected', icon: '☁️' },
  { name: 'Zapier', category: 'Automation', status: 'Connected', icon: '⚡' },
];

const apiKeys = [
  { name: 'Production API Key', key: 'crm_prod_****...8f2a', created: 'Nov 15, 2025', lastUsed: '2 hours ago' },
  { name: 'Staging API Key', key: 'crm_stg_****...3d1b', created: 'Dec 1, 2025', lastUsed: '3 days ago' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { key: 'general', label: 'General', icon: <HiOutlineCog /> },
    { key: 'integrations', label: 'Integrations', icon: <HiOutlineGlobe /> },
    { key: 'api', label: 'API Keys', icon: <HiOutlineKey /> },
    { key: 'notifications', label: 'Notifications', icon: <HiOutlineBell /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your CRM configuration and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Settings Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ border: 'none', background: activeTab === tab.key ? 'var(--primary-light)' : 'transparent', textAlign: 'left', fontFamily: 'var(--font)' }}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div>
          {activeTab === 'general' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">General Settings</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input className="form-input" defaultValue="Acme Corp" />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Email</label>
                  <input className="form-input" defaultValue="admin@acmecorp.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-select" defaultValue="America/New_York">
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Los_Angeles</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select className="form-select" defaultValue="MM/DD/YYYY">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>AI Features</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enable AI-powered scoring, insights, and predictions</div>
                  </div>
                  <div className="toggle active" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>CDP Event Tracking</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Collect and unify customer events from all sources</div>
                  </div>
                  <div className="toggle active" />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <HiOutlineSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Integrations</div>
                <button className="btn btn-primary btn-sm">Add Integration</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {integrations.map((int) => (
                  <div key={int.name} style={{
                    padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
                    border: `1px solid ${int.status === 'Connected' ? 'var(--border)' : 'var(--border-light)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{int.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{int.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{int.category}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${int.status === 'Connected' ? 'badge-green' : 'badge-gray'}`}>{int.status}</span>
                      <button className="btn btn-outline btn-sm">
                        {int.status === 'Connected' ? 'Configure' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">API Keys</div>
                <button className="btn btn-primary btn-sm"><HiOutlineKey /> Generate Key</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Created</th>
                      <th>Last Used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.name}>
                        <td style={{ fontWeight: 600 }}>{key.name}</td>
                        <td><code style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{key.key}</code></td>
                        <td style={{ color: 'var(--text-muted)' }}>{key.created}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{key.lastUsed}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-outline btn-sm">Revoke</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Notification Preferences</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                {[
                  { label: 'New contact alerts', desc: 'Get notified when new contacts are added', enabled: true },
                  { label: 'Campaign completions', desc: 'Notify when a campaign finishes sending', enabled: true },
                  { label: 'AI insights', desc: 'Daily digest of AI-generated insights', enabled: true },
                  { label: 'Churn risk alerts', desc: 'Immediate alert when high-value contacts show churn signals', enabled: true },
                  { label: 'Weekly analytics report', desc: 'Summary of key metrics delivered weekly', enabled: false },
                  { label: 'System updates', desc: 'Notifications about platform updates and maintenance', enabled: false },
                ].map((pref, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{pref.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pref.desc}</div>
                    </div>
                    <div className={`toggle ${pref.enabled ? 'active' : ''}`} />
                  </div>
                ))}
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                  <HiOutlineSave /> Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
