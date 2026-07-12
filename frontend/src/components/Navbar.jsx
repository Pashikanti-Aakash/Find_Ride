import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    <nav className="glass-panel nav-bar" style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <Car size={28} color="var(--primary)" />
          <span style={styles.logoText}>
            Find <span className="gradient-text">Ride</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={styles.desktopLinks}>
          <Link to="/" className={isActive('/')} style={styles.link}>Home</Link>
          <Link to="/vehicles" className={isActive('/vehicles')} style={styles.link}>Browse Vehicles</Link>
          <Link to="/recommend" className={isActive('/recommend')} style={styles.link}>Get Recommendation</Link>
          <Link to="/compare" className={isActive('/compare')} style={styles.link}>Compare</Link>
          
          {user && user.role === 'user' && (
            <Link to="/favorites" className={isActive('/favorites')} style={styles.link}>
              <Heart size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Favorites
            </Link>
          )}
        </div>

        {/* Action Controls & Profile Menu */}
        <div style={styles.actions}>
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                style={styles.profileBtn}
              >
                <div style={styles.avatar}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={styles.username}>{user.username}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="glass-panel" style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    <span style={{
                      ...styles.badge,
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
                  
                  <div style={styles.divider}></div>
                  
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      style={styles.dropdownItem} 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Admin Portal
                    </Link>
                  )}
                  {user.role === 'manufacturer' && (
                    <Link 
                      to="/manufacturer" 
                      style={styles.dropdownItem} 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Partner Portal
                    </Link>
                  )}

                  <Link 
                    to="/profile" 
                    style={styles.dropdownItem} 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon size={16} /> Account Profile
                  </Link>

                  <div style={styles.divider}></div>

                  <button onClick={handleLogout} style={styles.logoutItem}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={{ ...styles.authBtn, color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            style={styles.mobileMenuToggle} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/vehicles" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Browse Vehicles</Link>
          <Link to="/recommend" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Get Recommendation</Link>
          <Link to="/compare" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Compare</Link>
          {user && user.role === 'user' && (
            <Link to="/favorites" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
          )}
          {!user && (
            <div style={styles.mobileAuthActions}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderRadius: 0,
    borderBottom: '1px solid var(--glass-border)',
    padding: '0.75rem 2rem',
    height: '70px',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoText: {
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    fontSize: '1.5rem',
    letterSpacing: '-0.5px',
    color: 'var(--text-primary)',
  },
  desktopLinks: {
    display: 'none',
    alignItems: 'center',
    gap: '2rem',
    '@media (min-width: 768px)': {
      display: 'flex',
    }
  },
  link: {
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    transition: 'background var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--bg-tertiary)',
    }
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  username: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline',
    }
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '45px',
    width: '240px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  dropdownHeader: {
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.125rem 0.5rem',
    borderRadius: '20px',
    alignSelf: 'flex-start',
    marginTop: '0.25rem',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.5rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'background var(--transition-fast), color var(--transition-fast)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '0.5rem 0',
  },
  logoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.5rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--error)',
    fontSize: '0.9rem',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background var(--transition-fast)',
  },
  authButtons: {
    display: 'none',
    alignItems: 'center',
    gap: '0.75rem',
    '@media (min-width: 640px)': {
      display: 'flex',
    }
  },
  authBtn: {
    fontWeight: 500,
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
  },
  mobileMenuToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'block',
    '@media (min-width: 768px)': {
      display: 'none',
    }
  },
  mobileMenu: {
    position: 'absolute',
    top: '70px',
    left: 0,
    right: 0,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    borderRadius: 0,
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    animation: 'fadeIn 0.2s ease-out',
    '@media (min-width: 768px)': {
      display: 'none',
    }
  },
  mobileLink: {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  mobileAuthActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  }
};

// CSS media query style injection helper
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @media (min-width: 768px) {
    .nav-bar .nav-link { display: inline-block; }
    .nav-bar button[style*="mobileMenuToggle"] { display: none !important; }
    .nav-bar div[style*="desktopLinks"] { display: flex !important; }
    .nav-bar div[style*="authButtons"] { display: flex !important; }
  }
  .nav-bar .nav-link:hover {
    color: var(--primary) !important;
  }
  .nav-bar .nav-link.active {
    color: var(--primary) !important;
    position: relative;
  }
  .nav-bar .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -22px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border-radius: 3px 3px 0 0;
  }
  .nav-bar div[style*="dropdown"] a:hover,
  .nav-bar div[style*="dropdown"] button:hover {
    background-color: var(--bg-tertiary);
    color: var(--primary);
  }
`;
document.head.appendChild(styleTag);

export default Navbar;
