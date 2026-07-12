import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Protect private routes for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protect routes that require specific roles (e.g. admin or manufacturer)
export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, manufacturerDetails, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying role authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user tries to access a role-restricted page they don't belong to
    return <Navigate to="/" replace />;
  }

  // If manufacturer, check if they are approved for sub-dashboard elements
  // Wait, let the dashboard itself handle the pending state presentation,
  // but if we are targeting general manufacturer paths, let it pass through.
  return children;
};

const styles = {
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%'
  }
};
