import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirects and session-expired query flags
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setInfoMessage('Your session has expired. Please log in again.');
    }

    // Already logged in? Redirect accordingly
    if (user) {
      redirectUser(user);
    }
  }, [user, location]);

  const redirectUser = (currentUser) => {
    if (currentUser.role === 'admin') {
      navigate('/admin');
    } else if (currentUser.role === 'manufacturer') {
      navigate('/manufacturer');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!loginIdentifier || !password) {
      setError('Please enter all credentials.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginIdentifier, password);
    setIsSubmitting(false);

    if (result.success) {
      redirectUser(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.pageWrapper} className="animate-fade-in">
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your Find Ride account</p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={styles.errorBanner} className="animate-slide-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Global Info Banner */}
        {infoMessage && (
          <div style={styles.infoBanner} className="animate-slide-in">
            <AlertCircle size={18} />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username or Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="loginIdentifier">
              Username or Email
            </label>
            <div style={styles.inputContainer}>
              <Mail style={styles.inputIcon} size={18} />
              <input
                id="loginIdentifier"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Enter username or email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <div style={styles.passwordLabelContainer}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
            </div>
            <div style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem 2rem',
    boxShadow: 'var(--shadow-xl)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.925rem',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--error)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  inputWithIcon: {
    paddingLeft: '2.75rem',
  },
  passwordLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  eyeBtn: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  submitBtn: {
    width: '100%',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
  }
};

export default Login;
