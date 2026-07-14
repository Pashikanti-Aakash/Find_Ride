import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Login.css';

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
    <div className="login-wrapper animate-fade-in">
      <div className="glass-panel login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your Find Ride account</p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="login-error-banner animate-slide-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Global Info Banner */}
        {infoMessage && (
          <div className="login-info-banner animate-slide-in">
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
            <div className="login-input-container">
              <Mail className="login-input-icon" size={18} />
              <input
                id="loginIdentifier"
                type="text"
                className="form-input login-input-with-icon"
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
            <div className="login-password-label-container">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
            </div>
            <div className="login-input-container">
              <Lock className="login-input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input login-input-with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-btn"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
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

export default Login;
