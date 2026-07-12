import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Award, 
  Users, 
  Car, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Sliders,
  Bell
} from 'lucide-react';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Admin Actions
  const adminLinks = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'brands', name: 'Brands Manager', icon: <Award size={20} /> },
    { id: 'approvals', name: 'Onboarding Approvals', icon: <Users size={20} /> },
  ];

  // Manufacturer Actions
  const manufacturerLinks = [
    { id: 'overview', name: 'Overview Stats', icon: <LayoutDashboard size={20} /> },
    { id: 'vehicles', name: 'Vehicle Manager', icon: <Car size={20} /> },
    { id: 'reviews', name: 'Customer Reviews', icon: <Star size={20} /> },
  ];

  const links = role === 'admin' ? adminLinks : manufacturerLinks;

  return (
    <div style={{
      ...styles.sidebar,
      width: collapsed ? '70px' : '260px'
    }} className="glass-panel">
      
      {/* Collapse Toggle Trigger */}
      <button 
        onClick={() => setCollapsed(!collapsed)} 
        style={styles.toggleBtn}
        title={collapsed ? "Expand Menu" : "Collapse Menu"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Menu */}
      <div style={styles.navMenu}>
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            style={{
              ...styles.navItem,
              justifyContent: collapsed ? 'center' : 'flex-start',
              backgroundColor: activeTab === link.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === link.id ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            className="sidebar-item"
            title={collapsed ? link.name : ''}
          >
            <span style={{ color: activeTab === link.id ? 'var(--primary)' : 'inherit' }}>
              {link.icon}
            </span>
            {!collapsed && <span style={styles.navName}>{link.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 110px)',
    position: 'sticky',
    top: '90px',
    padding: '1.25rem 0.75rem',
    gap: '1.5rem',
    transition: 'width var(--transition-slow)',
    flexShrink: 0,
    zIndex: 10,
  },
  toggleBtn: {
    alignSelf: 'flex-end',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    position: 'absolute',
    right: '-13px',
    top: '20px',
    boxShadow: 'var(--shadow-sm)',
    zIndex: 20,
    transition: 'background var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--border-color)',
    }
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '0.925rem',
    transition: 'all var(--transition-fast)',
  },
  navName: {
    animation: 'fadeIn 0.2s ease-out',
  }
};

// Embed CSS Hover styles
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .sidebar-item:hover {
    background-color: var(--bg-tertiary) !important;
    color: var(--primary) !important;
  }
`;
document.head.appendChild(styleTag);

export default Sidebar;
