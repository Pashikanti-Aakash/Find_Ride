import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Building, FileText, Bookmark, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'user' or 'manufacturer'
  const [role, setRole] = useState('user');

  // Input States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Manufacturer States
  const [brandName, setBrandName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Error/Status States
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read URL query params in case role is pre-selected (e.g. from footer link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'manufacturer' || roleParam === 'user') {
      setRole(roleParam);
    }
  }, [location]);

  // Already logged in? Redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/');
    }
  }, [user]);

  const validate = () => {
    const errors = {};
    if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address.';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (role === 'manufacturer') {
      if (!brandName.trim()) errors.brandName = 'Brand name is required.';
      if (!companyName.trim()) errors.companyName = 'Company name is required.';
      if (!registrationNumber.trim()) errors.registrationNumber = 'Registration ID is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setFormErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    const userData = {
      username,
      email,
      password,
      role,
      ...(role === 'manufacturer' && {
        brandName,
        companyName,
        registrationNumber
      })
    };

    const result = await register(userData);
    setIsSubmitting(false);

    if (result.success) {
      if (role === 'manufacturer') {
        navigate('/manufacturer'); // Pending dashboard
      } else {
        navigate('/');
      }
    } else {
      if (result.errors) {
        setFormErrors(result.errors);
      } else {
        setServerError(result.message);
      }
    }
  };

  return (
    <div style={styles.pageWrapper} className="animate-fade-in">
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Sign up to Find Ride vehicle recommendations</p>
        </div>

        {/* Role Tabs */}
        <div style={styles.tabs}>
          <button
            type="button"
            style={{
              ...styles.tab,
              borderBottomColor: role === 'user' ? 'var(--primary)' : 'transparent',
              color: role === 'user' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            onClick={() => {
              setRole('user');
              setFormErrors({});
              setServerError('');
            }}
            disabled={isSubmitting}
          >
            Customer
          </button>
          <button
            type="button"
            style={{
              ...styles.tab,
              borderBottomColor: role === 'manufacturer' ? 'var(--primary)' : 'transparent',
              color: role === 'manufacturer' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            onClick={() => {
              setRole('manufacturer');
              setFormErrors({});
              setServerError('');
            }}
            disabled={isSubmitting}
          >
            Brand Partner
          </button>
        </div>

        {/* Global Server Error */}
        {serverError && (
          <div style={styles.errorBanner} className="animate-slide-in">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={styles.inputContainer}>
              <User style={styles.inputIcon} size={18} />
              <input
                id="username"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            {formErrors.username && <span className="form-error">{formErrors.username}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={styles.inputContainer}>
              <Mail style={styles.inputIcon} size={18} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>

          {/* Manufacturer Specific Fields */}
          {role === 'manufacturer' && (
            <div className="animate-slide-in" style={styles.manufacturerSection}>
              <div style={styles.alertNote}>
                <Building size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Manufacturer registration requests are sent to an administrator. Accounts are restricted until approval is completed.
                </span>
              </div>

              {/* Brand Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="brandName">Automobile Brand</label>
                <div style={styles.inputContainer}>
                  <Bookmark style={styles.inputIcon} size={18} />
                  <input
                    id="brandName"
                    type="text"
                    className="form-input"
                    style={styles.inputWithIcon}
                    placeholder="e.g. Honda, Tesla, BMW"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {formErrors.brandName && <span className="form-error">{formErrors.brandName}</span>}
              </div>

              {/* Company Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="companyName">Company Name</label>
                <div style={styles.inputContainer}>
                  <Building style={styles.inputIcon} size={18} />
                  <input
                    id="companyName"
                    type="text"
                    className="form-input"
                    style={styles.inputWithIcon}
                    placeholder="e.g. Honda Motor Co., Ltd."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {formErrors.companyName && <span className="form-error">{formErrors.companyName}</span>}
              </div>

              {/* Registration Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="registrationNumber">Company Registration ID</label>
                <div style={styles.inputContainer}>
                  <FileText style={styles.inputIcon} size={18} />
                  <input
                    id="registrationNumber"
                    type="text"
                    className="form-input"
                    style={styles.inputWithIcon}
                    placeholder="e.g. REG-89721-JP"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {formErrors.registrationNumber && <span className="form-error">{formErrors.registrationNumber}</span>}
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            {formErrors.password && <span className="form-error">{formErrors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} />
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            {formErrors.confirmPassword && <span className="form-error">{formErrors.confirmPassword}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
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
    minHeight: '80vh',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '2.5rem 2rem',
    boxShadow: 'var(--shadow-xl)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
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
  tabs: {
    display: 'flex',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  tab: {
    flex: 1,
    padding: '0.75rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all var(--transition-fast)',
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
  manufacturerSection: {
    padding: '1rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '1.25rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  alertNote: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'start',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
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

export default Register;
