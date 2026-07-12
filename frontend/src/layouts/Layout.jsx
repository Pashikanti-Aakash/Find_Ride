import React from 'react';
import Navbar from '../components/Navbar';

const Layout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main style={styles.main}>
        {children}
      </main>

      {/* Elegant Footer */}
      <footer className="glass-panel" style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.brandSec}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Find <span className="gradient-text">Ride</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
              Find your perfect ride using our intelligent, weighted multi-attribute matching portal.
            </p>
          </div>
          
          <div style={styles.linksSec}>
            <div style={styles.linksCol}>
              <h4 style={styles.colTitle}>Platform</h4>
              <a href="/vehicles" style={styles.footerLink}>Browse Catalog</a>
              <a href="/recommend" style={styles.footerLink}>Recommendation Finder</a>
              <a href="/compare" style={styles.footerLink}>Compare Board</a>
            </div>
            
            <div style={styles.linksCol}>
              <h4 style={styles.colTitle}>Partners</h4>
              <a href="/register?role=manufacturer" style={styles.footerLink}>Join as Manufacturer</a>
              <a href="/login" style={styles.footerLink}>Partner Login</a>
            </div>
          </div>
        </div>

        <div style={styles.copyright}>
          <p>© {new Date().getFullYear()} Find Ride Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    marginTop: 'auto',
    borderRadius: 0,
    borderWidth: '1px 0 0 0',
    borderTopColor: 'var(--border-color)',
    padding: '3rem 2rem 1.5rem 2rem',
  },
  footerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '2rem',
    marginBottom: '2rem',
  },
  brandSec: {
    flex: '1 1 300px',
  },
  linksSec: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4rem',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  colTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
    color: 'var(--text-primary)',
  },
  footerLink: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
    '&:hover': {
      color: 'var(--primary)',
    }
  },
  copyright: {
    maxWidth: '1280px',
    margin: '0 auto',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  }
};

// Footer CSS style injection
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  footer a:hover {
    color: var(--primary) !important;
  }
`;
document.head.appendChild(styleTag);

export default Layout;
