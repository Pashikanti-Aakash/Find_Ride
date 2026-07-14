import React from 'react';
import Navbar from '../components/Navbar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="layout-main">
        {children}
      </main>

      {/* Elegant Footer */}
      <footer className="glass-panel layout-footer">
        <div className="layout-footer-container">
          <div className="layout-brand-sec">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Find <span className="gradient-text">Ride</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
              Find your perfect ride using our intelligent, weighted multi-attribute matching portal.
            </p>
          </div>
          
          <div className="layout-links-sec">
            <div className="layout-links-col">
              <h4 className="layout-col-title">Platform</h4>
              <a href="/vehicles" className="layout-footer-link">Browse Catalog</a>
              <a href="/recommend" className="layout-footer-link">Recommendation Finder</a>
              <a href="/compare" className="layout-footer-link">Compare Board</a>
            </div>
            
            <div className="layout-links-col">
              <h4 className="layout-col-title">Partners</h4>
              <a href="/register?role=manufacturer" className="layout-footer-link">Join as Manufacturer</a>
              <a href="/login" className="layout-footer-link">Partner Login</a>
            </div>
          </div>
        </div>

        <div className="layout-copyright">
          <p>© {new Date().getFullYear()} Find Ride Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
