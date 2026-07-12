import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PortalLayout from '../layouts/PortalLayout';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { 
  Award, 
  Users, 
  Car, 
  ShieldCheck,
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  Building,
  Image as ImageIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Brands State
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null); // null for Add, object for Edit
  const [brandForm, setBrandForm] = useState({ name: '', description: '', logoUrl: '', manufacturerId: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [brandError, setBrandError] = useState('');
  const [brandSuccess, setBrandSuccess] = useState('');
  const [submittingBrand, setSubmittingBrand] = useState(false);

  // Manufacturers Onboarding State
  const [manufacturers, setManufacturers] = useState([]);
  const [mLoading, setMLoading] = useState(false);
  const [approvalError, setApprovalError] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState('');

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Brand Records
  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch Manufacturer Registrations
  const fetchManufacturers = async () => {
    try {
      setMLoading(true);
      const res = await api.get('/admin/manufacturers');
      setManufacturers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMLoading(false);
    }
  };

  // Load appropriate data when tab switches
  useEffect(() => {
    fetchStats();
    if (activeTab === 'brands') {
      fetchBrands();
      fetchManufacturers(); // For associating approved manufacturers in select dropdown
    } else if (activeTab === 'approvals') {
      fetchManufacturers();
    }
  }, [activeTab]);

  // Handle Onboarding Approval / Rejection
  const handleManufacturerStatus = async (id, status) => {
    setApprovalError('');
    setApprovalSuccess('');
    
    if (!window.confirm(`Are you sure you want to change this registration status to ${status.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await api.put(`/admin/manufacturers/${id}/status`, { status });
      setApprovalSuccess(res.data.message);
      fetchManufacturers();
      fetchStats();
    } catch (err) {
      setApprovalError(err.response?.data?.message || 'Failed to update partner registration status.');
    }
  };

  // Open Brand Modal
  const openBrandModal = (brand = null) => {
    setBrandError('');
    setBrandSuccess('');
    setLogoFile(null);
    if (brand) {
      setCurrentBrand(brand);
      setBrandForm({
        name: brand.name,
        description: brand.description || '',
        logoUrl: brand.logo_url || '',
        manufacturerId: brand.manufacturer_id || ''
      });
    } else {
      setCurrentBrand(null);
      setBrandForm({ name: '', description: '', logoUrl: '', manufacturerId: '' });
    }
    setShowBrandModal(true);
  };

  // Handle Brand Create / Update Submit
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setBrandError('');
    setBrandSuccess('');

    if (!brandForm.name.trim()) {
      setBrandError('Brand name is required.');
      return;
    }

    setSubmittingBrand(true);
    try {
      // Use FormData to allow file uploads (Multer parses this on backend)
      const formData = new FormData();
      formData.append('name', brandForm.name);
      formData.append('description', brandForm.description);
      formData.append('manufacturerId', brandForm.manufacturerId);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      } else {
        formData.append('logoUrl', brandForm.logoUrl);
      }

      let res;
      if (currentBrand) {
        res = await api.put(`/brands/${currentBrand.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBrandSuccess(res.data.message);
      } else {
        res = await api.post('/brands', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBrandSuccess(res.data.message);
      }

      fetchBrands();
      fetchStats();
      setTimeout(() => setShowBrandModal(false), 1500);
    } catch (err) {
      setBrandError(err.response?.data?.message || 'Failed to submit brand details.');
    } finally {
      setSubmittingBrand(false);
    }
  };

  // Handle Brand Deletion
  const handleDeleteBrand = async (id, name) => {
    setBrandError('');
    setBrandSuccess('');
    
    if (!window.confirm(`WARNING: Deleting brand "${name}" will remove all mapped vehicles and variants. Are you sure?`)) {
      return;
    }

    try {
      const res = await api.delete(`/brands/${id}`);
      setBrandSuccess(res.data.message);
      fetchBrands();
      fetchStats();
    } catch (err) {
      setBrandError(err.response?.data?.message || 'Failed to delete brand.');
    }
  };

  const getApprovedManufacturers = () => {
    return manufacturers.filter(m => m.status === 'approved');
  };

  return (
    <PortalLayout role="admin" activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={styles.dashboardContainer} className="animate-fade-in">
        
        {/* Dynamic Section Header */}
        <div style={styles.header}>
          <h1>Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'overview' && 'System statistics and pending onboarding overview'}
            {activeTab === 'brands' && 'Manage automobile catalog brands list'}
            {activeTab === 'approvals' && 'Review and toggle partner registrations status'}
          </p>
        </div>

        {/* Tab 1: OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <div style={styles.sectionFlow}>
            {/* Stats Metric Cards Grid */}
            <div style={styles.statsGrid}>
              <div className="glass-panel" style={styles.statCard}>
                <Users size={24} color="var(--primary)" />
                <div>
                  <h3 style={styles.statVal}>{statsLoading ? '...' : stats?.totalUsers}</h3>
                  <p style={styles.statLabel}>Customers Registered</p>
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <Award size={24} color="var(--accent)" />
                <div>
                  <h3 style={styles.statVal}>{statsLoading ? '...' : stats?.totalBrands}</h3>
                  <p style={styles.statLabel}>Automobile Brands</p>
                </div>
              </div>

              <div className="glass-panel" style={styles.statCard}>
                <Building size={24} color="var(--success)" />
                <div>
                  <h3 style={styles.statVal}>{statsLoading ? '...' : stats?.totalManufacturers}</h3>
                  <p style={styles.statLabel}>Brand Partners</p>
                </div>
              </div>

              <div className="glass-panel" style={{
                ...styles.statCard, 
                borderColor: stats?.pendingManufacturers > 0 ? 'var(--warning)' : 'var(--glass-border)',
                background: stats?.pendingManufacturers > 0 ? 'radial-gradient(circle at top right, rgba(245,158,11,0.05), transparent 40%), var(--glass-bg)' : 'var(--glass-bg)'
              }}>
                <ShieldCheck size={24} color={stats?.pendingManufacturers > 0 ? 'var(--warning)' : 'var(--text-muted)'} />
                <div>
                  <h3 style={styles.statVal}>{statsLoading ? '...' : stats?.pendingManufacturers}</h3>
                  <p style={styles.statLabel}>Pending Approvals</p>
                </div>
              </div>
            </div>

            {/* Quick Actions / Pending Alert Board */}
            <div className="glass-panel" style={styles.cardBox}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Onboarding Activity Tracker
              </h2>
              {stats?.pendingManufacturers > 0 ? (
                <div style={styles.pendingNotification}>
                  <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ fontWeight: 600 }}>Action Required</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      There are {stats.pendingManufacturers} partner accounts waiting for database verification approval.
                    </p>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('approvals')}>
                    Open Approvals Tab
                  </button>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  All manufacturer registrations have been verified and processed. No pending requests.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: BRANDS MANAGER */}
        {activeTab === 'brands' && (
          <div style={styles.sectionFlow}>
            {brandError && <div style={styles.errorBanner} className="animate-slide-in"><AlertCircle size={18} /> {brandError}</div>}
            {brandSuccess && <div style={styles.successBanner} className="animate-slide-in"><Check size={18} /> {brandSuccess}</div>}

            <div style={styles.actionRow}>
              <h2>Catalog Brands ({brands.length})</h2>
              <button className="btn btn-primary" onClick={() => openBrandModal(null)}>
                <Plus size={18} /> Add New Brand
              </button>
            </div>

            {brandsLoading ? (
              <TableSkeleton cols={4} rows={3} />
            ) : brands.length === 0 ? (
              <div className="glass-panel" style={styles.emptyCard}>
                <p style={{ color: 'var(--text-secondary)' }}>No brands configured yet. Click "Add New Brand" to begin.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Logo</th>
                      <th style={styles.th}>Brand Name</th>
                      <th style={styles.th}>Represented By</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.id} style={styles.tr}>
                        <td style={styles.td}>
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} style={styles.logoPreview} />
                          ) : (
                            <div style={styles.logoPlaceholder}><ImageIcon size={16} /></div>
                          )}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{brand.name}</td>
                        <td style={styles.td}>
                          {brand.manufacturer_company ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {brand.manufacturer_company}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassociated</span>
                          )}
                        </td>
                        <td style={{ ...styles.td, color: 'var(--text-secondary)', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {brand.description || '-'}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={styles.editBtn} onClick={() => openBrandModal(brand)} title="Edit Brand">
                              <Edit size={16} />
                            </button>
                            <button style={styles.deleteBtn} onClick={() => handleDeleteBrand(brand.id, brand.name)} title="Delete Brand">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: ONBOARDING APPROVALS */}
        {activeTab === 'approvals' && (
          <div style={styles.sectionFlow}>
            {approvalError && <div style={styles.errorBanner} className="animate-slide-in"><AlertCircle size={18} /> {approvalError}</div>}
            {approvalSuccess && <div style={styles.successBanner} className="animate-slide-in"><Check size={18} /> {approvalSuccess}</div>}

            <h2>Manufacturer Registrations ({manufacturers.length})</h2>

            {mLoading ? (
              <TableSkeleton cols={5} rows={3} />
            ) : manufacturers.length === 0 ? (
              <div className="glass-panel" style={styles.emptyCard}>
                <p style={{ color: 'var(--text-secondary)' }}>No manufacturer registration records found.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Brand</th>
                      <th style={styles.th}>Company Details</th>
                      <th style={styles.th}>Registration ID</th>
                      <th style={styles.th}>User Account</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturers.map((m) => (
                      <tr key={m.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{m.brand_name}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{m.company_name}</span>
                            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Registered: {new Date(m.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.85rem' }}>{m.registration_number}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{m.username}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.email}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: m.status === 'approved' ? 'rgba(16,185,129,0.15)' : 
                                             m.status === 'pending' ? 'rgba(245,158,11,0.15)' : 
                                             'rgba(239,68,68,0.15)',
                            color: m.status === 'approved' ? 'var(--success)' : 
                                   m.status === 'pending' ? 'var(--warning)' : 
                                   'var(--error)'
                          }}>
                            {m.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {m.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}
                                onClick={() => handleManufacturerStatus(m.id, 'approved')}
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                onClick={() => handleManufacturerStatus(m.id, 'rejected')}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BRANDS CRUD MODAL CONTAINER */}
        {showBrandModal && (
          <div style={styles.modalBackdrop}>
            <div className="glass-panel animate-slide-in" style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <h2>{currentBrand ? 'Edit Brand Record' : 'Add Catalog Brand'}</h2>
                <button style={styles.closeBtn} onClick={() => setShowBrandModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {brandError && <div style={styles.errorBanner}><AlertCircle size={18} /> {brandError}</div>}
              {brandSuccess && <div style={styles.successBanner}><Check size={18} /> {brandSuccess}</div>}

              <form onSubmit={handleBrandSubmit} style={{ marginTop: '1.25rem' }}>
                
                {/* Brand Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="brand-name">Brand Name</label>
                  <input
                    id="brand-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. BMW, Tesla"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    required
                    disabled={submittingBrand}
                  />
                </div>

                {/* Logo resolution: upload file OR write URL */}
                <div className="form-group">
                  <label className="form-label" htmlFor="brand-logo-file">Brand Logo Image</label>
                  <input
                    id="brand-logo-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    disabled={submittingBrand}
                    style={{ fontSize: '0.9rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Or provide a static URL below (file uploads take priority if selected):
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                    value={brandForm.logoUrl}
                    onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                    disabled={logoFile !== null || submittingBrand}
                  />
                </div>

                {/* Associated Manufacturer selection */}
                <div className="form-group">
                  <label className="form-label" htmlFor="brand-manufacturer">Associated Manufacturer</label>
                  <select
                    id="brand-manufacturer"
                    className="form-input"
                    value={brandForm.manufacturerId}
                    onChange={(e) => setBrandForm({ ...brandForm, manufacturerId: e.target.value })}
                    disabled={submittingBrand}
                  >
                    <option value="">-- No Association --</option>
                    {getApprovedManufacturers().map(m => (
                      <option key={m.id} value={m.id}>
                        {m.company_name} ({m.brand_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" htmlFor="brand-desc">Description</label>
                  <textarea
                    id="brand-desc"
                    className="form-input"
                    rows={3}
                    placeholder="Brief description about the automobile manufacturer..."
                    value={brandForm.description}
                    onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                    disabled={submittingBrand}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowBrandModal(false)}
                    disabled={submittingBrand}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingBrand}
                  >
                    {submittingBrand ? <div className="spinner"></div> : (currentBrand ? 'Save Changes' : 'Create Brand')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  sectionFlow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
  cardBox: {
    padding: '2rem',
    boxShadow: 'var(--shadow-md)',
  },
  pendingNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '1rem',
    borderRadius: 'var(--radius-lg)',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.925rem',
  },
  th: {
    padding: '0.75rem 1rem',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--bg-tertiary)',
    }
  },
  td: {
    padding: '0.85rem 1rem',
    verticalAlign: 'middle',
  },
  logoPreview: {
    height: '24px',
    maxWidth: '60px',
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: '32px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary)',
    padding: '0.25rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--error)',
    padding: '0.25rem',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    display: 'inline-block',
  },
  emptyCard: {
    padding: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed var(--border-color)',
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
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    backdropFilter: 'blur(4px)',
    padding: '1rem',
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '2rem',
    boxShadow: 'var(--shadow-xl)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  }
};

// CSS table row hover injection
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  table tbody tr:hover {
    background-color: var(--bg-tertiary);
  }
`;
document.head.appendChild(styleTag);

export default AdminDashboard;
