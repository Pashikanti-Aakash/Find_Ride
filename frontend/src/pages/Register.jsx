import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Building, FileText, Bookmark, AlertCircle } from 'lucide-react';
import './Register.css';

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
    <div className="register-wrapper animate-fade-in">
      <div className="glass-panel register-card">
        <div className="register-header">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Sign up to Find Ride vehicle recommendations</p>
        </div>

        {/* Role Tabs */}
        <div className="register-tabs">
          <button
            type="button"
            className="register-tab"
            style={{
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
            className="register-tab"
            style={{
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
          <div className="register-error-banner animate-slide-in">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="register-input-container">
              <User className="register-input-icon" size={18} />
              <input
                id="username"
                type="text"
                className="form-input register-input-with-icon"
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
            <div className="register-input-container">
              <Mail className="register-input-icon" size={18} />
              <input
                id="email"
                type="email"
                className="form-input register-input-with-icon"
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
            <div className="animate-slide-in register-manufacturer-section">
              <div className="register-alert-note">
                <Building size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Manufacturer registration requests are sent to an administrator. Accounts are restricted until approval is completed.
                </span>
              </div>

              {/* Brand Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="brandName">Automobile Brand</label>
                <div className="register-input-container">
                  <Bookmark className="register-input-icon" size={18} />
                  <input
                    id="brandName"
                    type="text"
                    className="form-input register-input-with-icon"
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
                <div className="register-input-container">
                  <Building className="register-input-icon" size={18} />
                  <input
                    id="companyName"
                    type="text"
                    className="form-input register-input-with-icon"
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
                <div className="register-input-container">
                  <FileText className="register-input-icon" size={18} />
                  <input
                    id="registrationNumber"
                    type="text"
                    className="form-input register-input-with-icon"
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
            <div className="register-input-container">
              <Lock className="register-input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-input register-input-with-icon"
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
            <div className="register-input-container">
              <Lock className="register-input-icon" size={18} />
              <input
                id="confirmPassword"
                type="password"
                className="form-input register-input-with-icon"
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
            className="btn btn-primary register-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
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

export default Register;
