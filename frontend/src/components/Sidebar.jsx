import React, { useState } from 'react';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  Award, 
  Users, 
  Car, 
  Star, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Admin Actions
  const adminLinks = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'brands', name: 'Brands Manager', icon: <Award size={20} /> },
    { id: 'approvals', name: 'Onboarding Approvals', icon: <Users size={20} /> },
    { id: 'vehicles', name: 'Review Vehicles', icon: <Car size={20} /> },
  ];

  // Manufacturer Actions
  const manufacturerLinks = [
    { id: 'overview', name: 'Overview Stats', icon: <LayoutDashboard size={20} /> },
    { id: 'vehicles', name: 'Vehicle Manager', icon: <Car size={20} /> },
    { id: 'reviews', name: 'Customer Reviews', icon: <Star size={20} /> },
  ];

  const links = role === 'admin' ? adminLinks : manufacturerLinks;

  return (
    <div 
      className="glass-panel sidebar-panel"
      style={{ width: collapsed ? '70px' : '260px' }}
    >
      {/* Collapse Toggle Trigger */}
      <button 
        onClick={() => setCollapsed(!collapsed)} 
        className="sidebar-toggle-btn"
        title={collapsed ? "Expand Menu" : "Collapse Menu"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Menu */}
      <div className="sidebar-nav-menu">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className="sidebar-nav-item"
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              backgroundColor: activeTab === link.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === link.id ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            title={collapsed ? link.name : ''}
          >
            <span style={{ color: activeTab === link.id ? 'var(--primary)' : 'inherit', display: 'flex', alignItems: 'center' }}>
              {link.icon}
            </span>
            {!collapsed && <span className="sidebar-nav-name">{link.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
