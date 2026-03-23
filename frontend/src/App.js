import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineSpeakerphone,
  HiOutlineCollection,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineDatabase,
  HiOutlineSparkles,
  HiOutlineCog,
} from 'react-icons/hi';

import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Segments from './pages/Segments';
import Automation from './pages/Automation';
import Analytics from './pages/Analytics';
import CDP from './pages/CDP';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

function App() {
  const location = useLocation();

  const navItems = [
    {
      section: 'Main',
      items: [
        { path: '/', icon: <HiOutlineHome />, label: 'Dashboard' },
        { path: '/contacts', icon: <HiOutlineUserGroup />, label: 'Contacts', badge: '2.4k' },
        { path: '/campaigns', icon: <HiOutlineSpeakerphone />, label: 'Campaigns', badge: '12' },
      ],
    },
    {
      section: 'Marketing',
      items: [
        { path: '/segments', icon: <HiOutlineCollection />, label: 'Segments' },
        { path: '/automation', icon: <HiOutlineLightningBolt />, label: 'Automation' },
      ],
    },
    {
      section: 'Intelligence',
      items: [
        { path: '/analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
        { path: '/cdp', icon: <HiOutlineDatabase />, label: 'CDP' },
        { path: '/ai-insights', icon: <HiOutlineSparkles />, label: 'AI Insights', badge: 'New' },
      ],
    },
    {
      section: 'System',
      items: [
        { path: '/settings', icon: <HiOutlineCog />, label: 'Settings' },
      ],
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e2d3d',
            color: '#f1f5f9',
            border: '1px solid #2a3f54',
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">AI</div>
          <div className="sidebar-brand">
            <h1>AI CRM</h1>
            <span>Marketing &amp; CDP</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="nav-section">
                <div className="nav-section-title">{section.section}</div>
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  end={item.path === '/'}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">JD</div>
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/cdp" element={<CDP />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
