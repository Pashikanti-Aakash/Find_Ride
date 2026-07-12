import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import PortalLayout from '../layouts/PortalLayout';
import { 
  CheckCircle, 
  ShieldAlert, 
  Car, 
  Eye, 
  Heart, 
  Star,
  Plus,
  Sparkles
} from 'lucide-react';

const ManufacturerDashboard = () => {
  const { user, manufacturerDetails } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const isApproved = manufacturerDetails?.status === 'approved';

  // If pending or rejected, render simple notice layout
  if (!isApproved) {
    const isRejected = manufacturerDetails?.status === 'rejected';
    return (
      <div className="glass-panel animate-fade-in" style={styles.card}>
        {isRejected ? (
          <ShieldAlert size={56} color="var(--error)" style={{ marginBottom: '1rem' }} />
        ) : (
          <ShieldAlert size={56} color="var(--warning)" style={{ marginBottom: '1rem' }} />
        )}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Partner Portal Restricted</h2>
        <p style={styles.noticeText}>
          {isRejected ? (
            `Your brand partner registration request for "${manufacturerDetails?.brand_name || 'your brand'}" has been rejected by an administrator. Please contact our support team at administration@findride.com for detail resolutions.`
          ) : (
            `Your brand partner registration request for "${manufacturerDetails?.brand_name || 'your brand'}" is currently PENDING review. Our team is verifying your registration number "${manufacturerDetails?.registration_number || 'ID'}". This dashboard will unlock once approved.`
          )}
        </p>
      </div>
    );
  }

  return (
    <PortalLayout role="manufacturer" activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={styles.container} className="animate-fade-in">
        
        {/* Header */}
        <div style={styles.header}>
          <h1>Partner Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Workspace for {manufacturerDetails.company_name} representing brand **{manufacturerDetails.brand_name}**
          </p>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={styles.flow}>
            {/* Overview Stats */}
            <div style={styles.statsGrid}>
              <div className="glass-panel" style={styles.statCard}>
                <Car size={24} color="var(--primary)" />
                <div>
                  <h3 style={styles.statVal}>0</h3>
                  <p style={styles.statLabel}>Active Vehicles</p>
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <Eye size={24} color="var(--accent)" />
                <div>
                  <h3 style={styles.statVal}>0</h3>
                  <p style={styles.statLabel}>Total Views</p>
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <Heart size={24} color="var(--error)" />
                <div>
                  <h3 style={styles.statVal}>0</h3>
                  <p style={styles.statLabel}>User Favorites</p>
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <Star size={24} color="var(--warning)" />
                <div>
                  <h3 style={styles.statVal}>0.0</h3>
                  <p style={styles.statLabel}>Average Rating</p>
                </div>
              </div>
            </div>

            {/* Explainer Block */}
            <div className="glass-panel" style={styles.welcomeCard}>
              <Sparkles size={28} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Welcome to Find Ride Workspace</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
                Your account is approved! In the next phase (**Phase 3: Vehicle Inventory Management**), you will be able to populate your model catalog, add variants, specify paint options, upload product shots, and configure mileage specs.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: VEHICLE MANAGER PLACEHOLDER */}
        {activeTab === 'vehicles' && (
          <div className="glass-panel" style={styles.placeholderCard}>
            <Car size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2>Vehicle Inventory Manager</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
              The control deck to add, edit, and delete your brand vehicles (Toyota/Honda/Tesla models) is coming in Phase 3.
            </p>
          </div>
        )}

        {/* Tab 3: REVIEWS PLACEHOLDER */}
        {activeTab === 'reviews' && (
          <div className="glass-panel" style={styles.placeholderCard}>
            <Star size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2>Customer Reviews Feed</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
              Review summaries, ratings, and customer feedback boards for your vehicles are coming in Phase 5.
            </p>
          </div>
        )}

      </div>
    </PortalLayout>
  );
};

const styles = {
  card: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '45vh',
    marginTop: '2rem',
    boxShadow: 'var(--shadow-md)',
  },
  noticeText: {
    color: 'var(--text-secondary)',
    marginTop: '1rem',
    maxWidth: '550px',
    textAlign: 'center',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  flow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  statVal: {
    fontSize: '1.75rem',
    fontWeight: 800,
    lineHeight: 1.1,
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.825rem',
    fontWeight: 500,
    marginTop: '0.25rem',
  },
  welcomeCard: {
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--shadow-md)',
  },
  placeholderCard: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    marginTop: '1rem',
  }
};

export default ManufacturerDashboard;
