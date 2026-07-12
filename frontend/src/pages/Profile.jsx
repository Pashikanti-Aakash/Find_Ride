import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, manufacturerDetails, updateProfile, updatePassword } = useContext(AuthContext);

  // Profile Form States
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!user) {
    return (
      <div className="glass-panel" style={styles.errorCard}>
        <AlertCircle size={48} color="var(--error)" />
        <h2 style={{ marginTop: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be logged in to view your profile.</p>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    
    if (username.trim().length < 3) {
      setProfileError('Username must be at least 3 characters.');
      return;
    }

    setProfileLoading(true);
    const result = await updateProfile(username, email);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess('Profile details updated successfully.');
    } else {
      setProfileError(result.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (result.success) {
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.message);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h1>Account Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and security credentials</p>
      </div>

      <div style={styles.layout}>
        {/* Left Side: General Profile Settings */}
        <div className="glass-panel" style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>General Information</h2>
          <div style={styles.divider}></div>

          {profileSuccess && (
            <div style={styles.successBanner} className="animate-slide-in">
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div style={styles.errorBanner} className="animate-slide-in">
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-username">Username</label>
              <div style={styles.inputContainer}>
                <User style={styles.inputIcon} size={18} />
                <input
                  id="profile-username"
                  type="text"
                  className="form-input"
                  style={styles.inputWithIcon}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={profileLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <div style={styles.inputContainer}>
                <Mail style={styles.inputIcon} size={18} />
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  style={styles.inputWithIcon}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={profileLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileLoading}
              style={{ minWidth: '140px' }}
            >
              {profileLoading ? <div className="spinner"></div> : 'Save Changes'}
            </button>
          </form>

          {/* Manufacturer detail block if role = manufacturer */}
          {user.role === 'manufacturer' && manufacturerDetails && (
            <div style={styles.detailsBlock} className="animate-slide-in">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--accent)" /> Manufacturer Entity Details
              </h3>
              <div style={styles.detailsGrid}>
                <div style={styles.detailsRow}>
                  <span style={styles.detailsLabel}>Brand Represented:</span>
                  <span style={styles.detailsValue}>{manufacturerDetails.brand_name}</span>
                </div>
                <div style={styles.detailsRow}>
                  <span style={styles.detailsLabel}>Company Name:</span>
                  <span style={styles.detailsValue}>{manufacturerDetails.company_name}</span>
                </div>
                <div style={styles.detailsRow}>
                  <span style={styles.detailsLabel}>Registration ID:</span>
                  <span style={styles.detailsValue}>{manufacturerDetails.registration_number}</span>
                </div>
                <div style={styles.detailsRow}>
                  <span style={styles.detailsLabel}>Approval Status:</span>
                  <span style={{
                    ...styles.detailsValue,
                    fontWeight: 700,
                    color: manufacturerDetails.status === 'approved' ? 'var(--success)' : 
                           manufacturerDetails.status === 'pending' ? 'var(--warning)' : 
                           'var(--error)'
                  }}>
                    {manufacturerDetails.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Security Password Settings */}
        <div className="glass-panel" style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Change Password</h2>
          <div style={styles.divider}></div>

          {passwordSuccess && (
            <div style={styles.successBanner} className="animate-slide-in">
              <CheckCircle size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div style={styles.errorBanner} className="animate-slide-in">
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">Current Password</label>
              <div style={styles.inputContainer}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  id="currentPassword"
                  type="password"
                  className="form-input"
                  style={styles.inputWithIcon}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <div style={styles.inputContainer}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  style={styles.inputWithIcon}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <div style={styles.inputContainer}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  style={styles.inputWithIcon}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordLoading}
              style={{ minWidth: '140px' }}
            >
              {passwordLoading ? <div className="spinner"></div> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    marginTop: '1rem',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    alignItems: 'start',
  },
  sectionCard: {
    padding: '2rem',
    boxShadow: 'var(--shadow-md)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1rem 0 1.5rem 0',
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
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--success)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
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
  detailsBlock: {
    marginTop: '2rem',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  detailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.35rem',
  },
  detailsLabel: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  detailsValue: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  errorCard: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    marginTop: '2rem',
  }
};

export default Profile;
