import React from 'react';
import Sidebar from '../components/Sidebar';
import './PortalLayout.css';

const PortalLayout = ({ role, activeTab, setActiveTab, children }) => {
  return (
    <div className="portal-layout-wrapper">
      {/*Collapsible Navigation Panel */}
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Dashboard Panel */}
      <div className="portal-layout-content">
        {children}
      </div>
    </div>
  );
};

export default PortalLayout;
