import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import './Profile.css';

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
      <div className="glass-panel profile-error-card">
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
    <div className="profile-container animate-fade-in">
      <div className="profile-header">
        <h1>Account Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and security credentials</p>
      </div>

      <div className="profile-layout">
        {/* Left Side: General Profile Settings */}
        <div className="glass-panel profile-section-card">
          <h2 className="profile-section-title">General Information</h2>
          <div className="profile-divider"></div>

          {profileSuccess && (
            <div className="profile-success-banner animate-slide-in">
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="profile-error-banner animate-slide-in">
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-username">Username</label>
              <div className="profile-input-container">
                <User className="profile-input-icon" size={18} />
                <input
                  id="profile-username"
                  type="text"
                  className="form-input profile-input-with-icon"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={profileLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <div className="profile-input-container">
                <Mail className="profile-input-icon" size={18} />
                <input
                  id="profile-email"
                  type="email"
                  className="form-input profile-input-with-icon"
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
            <div className="profile-details-block animate-slide-in">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--accent)" /> Manufacturer Entity Details
              </h3>
              <div className="profile-details-grid">
                <div className="profile-details-row">
                  <span className="profile-details-label">Brand Represented:</span>
                  <span className="profile-details-value">{manufacturerDetails.brand_name}</span>
                </div>
                <div className="profile-details-row">
                  <span className="profile-details-label">Company Name:</span>
                  <span className="profile-details-value">{manufacturerDetails.company_name}</span>
                </div>
                <div className="profile-details-row">
                  <span className="profile-details-label">Registration ID:</span>
                  <span className="profile-details-value">{manufacturerDetails.registration_number}</span>
                </div>
                <div className="profile-details-row">
                  <span className="profile-details-label">Approval Status:</span>
                  <span className="profile-details-value" style={{
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
        <div className="glass-panel profile-section-card">
          <h2 className="profile-section-title">Change Password</h2>
          <div className="profile-divider"></div>

          {passwordSuccess && (
            <div className="profile-success-banner animate-slide-in">
              <CheckCircle size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="profile-error-banner animate-slide-in">
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">Current Password</label>
              <div className="profile-input-container">
                <Lock className="profile-input-icon" size={18} />
                <input
                  id="currentPassword"
                  type="password"
                  className="form-input profile-input-with-icon"
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
              <div className="profile-input-container">
                <Lock className="profile-input-icon" size={18} />
                <input
                  id="newPassword"
                  type="password"
                  className="form-input profile-input-with-icon"
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
              <div className="profile-input-container">
                <Lock className="profile-input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input profile-input-with-icon"
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

export default Profile;
