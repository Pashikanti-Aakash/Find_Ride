import React from 'react';
import Sidebar from '../components/Sidebar';

const PortalLayout = ({ role, activeTab, setActiveTab, children }) => {
  return (
    <div style={styles.portalWrapper}>
      {/*Collapsible Navigation Panel */}
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Dashboard Panel */}
      <div style={styles.contentArea}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  portalWrapper: {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'start',
    width: '100%',
    minHeight: 'calc(100vh - 120px)',
  },
  contentArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
  }
};

export default PortalLayout;
