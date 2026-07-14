import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import { 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Car, 
  Heart, 
  Sliders, 
  GitCompare, 
  LayoutDashboard 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="glass-panel nav-bar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <Car size={28} color="var(--primary)" />
          <span className="nav-logo-text">
            Find <span className="gradient-text">Ride</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-desktop-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/vehicles" className={isActive('/vehicles')}>Browse Vehicles</Link>
          <Link to="/recommend" className={isActive('/recommend')}>Get Recommendation</Link>
          <Link to="/compare" className={isActive('/compare')}>Compare</Link>
          
          {user && user.role === 'user' && (
            <Link to="/favorites" className={isActive('/favorites')}>
              <Heart size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Favorites
            </Link>
          )}
        </div>

        {/* Action Controls & Profile Menu */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="nav-theme-toggle" title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="nav-profile-btn"
              >
                <div className="nav-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="nav-username">{user.username}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="glass-panel nav-dropdown">
                  <div className="nav-dropdown-header">
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    <span className="nav-badge" style={{
                      backgroundColor: user.role === 'admin' ? 'rgba(239,68,68,0.15)' : 
                                       user.role === 'manufacturer' ? 'rgba(6,182,212,0.15)' : 
                                       'rgba(16,185,129,0.15)',
                      color: user.role === 'admin' ? 'var(--error)' : 
                             user.role === 'manufacturer' ? 'var(--accent)' : 
                             'var(--success)'
                    }}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  
                  <div className="nav-divider"></div>
                  
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="nav-dropdown-item" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Admin Portal
                    </Link>
                  )}
                  {user.role === 'manufacturer' && (
                    <Link 
                      to="/manufacturer" 
                      className="nav-dropdown-item" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Partner Portal
                    </Link>
                  )}

                  <Link 
                    to="/profile" 
                    className="nav-dropdown-item" 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon size={16} /> Account Profile
                  </Link>

                  <div className="nav-divider"></div>

                  <button onClick={handleLogout} className="nav-logout-item">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-auth-btn" style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="nav-mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel nav-mobile-menu">
          <Link to="/" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/vehicles" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Browse Vehicles</Link>
          <Link to="/recommend" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Get Recommendation</Link>
          <Link to="/compare" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
          {user && user.role === 'user' && (
            <Link to="/favorites" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
          )}
          {!user && (
            <div className="nav-mobile-auth-actions">
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
