import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PortalLayout from '../layouts/PortalLayout';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import './AdminDashboard.css';
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

  // Pending Vehicles State
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [pvLoading, setPvLoading] = useState(false);

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
  const [manufacturersList, setManufacturersList] = useState([]); // local cache helper
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

  // Fetch Pending Vehicles
  const fetchPendingVehicles = async () => {
    try {
      setPvLoading(true);
      const res = await api.get('/vehicles/admin/pending');
      setPendingVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPvLoading(false);
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
    } else if (activeTab === 'vehicles') {
      fetchPendingVehicles();
    }
  }, [activeTab]);

  // Handle Onboarding Approval / Rejection
  const handleManufacturerStatus = async (id, status) => {
    setApprovalError('');
    setApprovalSuccess('');

    try {
      const res = await api.put(`/admin/manufacturers/${id}/status`, { status });
      setApprovalSuccess(res.data.message);
      fetchManufacturers();
      fetchStats();
    } catch (err) {
      setApprovalError(err.response?.data?.message || 'Failed to update partner registration status.');
    }
  };

  // Handle Vehicle Approval / Rejection (Remove Fake Listing)
  const handleVehicleStatus = async (id, status) => {
    setApprovalError('');
    setApprovalSuccess('');

    try {
      const res = await api.put(`/vehicles/admin/${id}/status`, { status });
      setApprovalSuccess(res.data.message);
      fetchPendingVehicles();
      fetchStats();
    } catch (err) {
      setApprovalError(err.response?.data?.message || 'Failed to update vehicle status.');
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
      <div className="portal-container animate-fade-in">
        
        {/* Dynamic Section Header */}
        <div className="portal-header">
          <h1>Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'overview' && 'System statistics and pending onboarding overview'}
            {activeTab === 'brands' && 'Manage automobile catalog brands list'}
            {activeTab === 'approvals' && 'Review and toggle partner registrations status'}
            {activeTab === 'vehicles' && 'Review and approve/reject partner vehicle uploads'}
          </p>
        </div>

        {/* Tab 1: OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            {/* Stats Metric Cards Grid */}
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <Users size={24} color="var(--primary)" />
                <div>
                  <h3 className="stat-card-value">{statsLoading ? '...' : stats?.totalUsers}</h3>
                  <p className="stat-card-label">Customers Registered</p>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <Award size={24} color="var(--accent)" />
                <div>
                  <h3 className="stat-card-value">{statsLoading ? '...' : stats?.totalBrands}</h3>
                  <p className="stat-card-label">Automobile Brands</p>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <Building size={24} color="var(--success)" />
                <div>
                  <h3 className="stat-card-value">{statsLoading ? '...' : stats?.totalManufacturers}</h3>
                  <p className="stat-card-label">Brand Partners</p>
                </div>
              </div>

              <div className="glass-panel stat-card" style={{
                borderColor: stats?.pendingManufacturers > 0 ? 'var(--warning)' : 'var(--glass-border)',
                background: stats?.pendingManufacturers > 0 ? 'radial-gradient(circle at top right, rgba(245,158,11,0.05), transparent 40%), var(--glass-bg)' : 'var(--glass-bg)'
              }}>
                <ShieldCheck size={24} color={stats?.pendingManufacturers > 0 ? 'var(--warning)' : 'var(--text-muted)'} />
                <div>
                  <h3 className="stat-card-value">{statsLoading ? '...' : stats?.pendingManufacturers}</h3>
                  <p className="stat-card-label">Pending Approvals</p>
                </div>
              </div>
            </div>

            {/* Quick Actions / Pending Alert Board */}
            <div className="glass-panel activity-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Onboarding Activity Tracker
              </h2>
              {stats?.pendingManufacturers > 0 ? (
                <div className="pending-alert-banner">
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
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            {brandError && <div className="errorBanner animate-slide-in"><AlertCircle size={18} /> {brandError}</div>}
            {brandSuccess && <div className="successBanner animate-slide-in"><Check size={18} /> {brandSuccess}</div>}

            <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Catalog Brands ({brands.length})</h2>
              <button className="btn btn-primary" onClick={() => openBrandModal(null)}>
                <Plus size={18} /> Add New Brand
              </button>
            </div>

            {brandsLoading ? (
              <TableSkeleton cols={5} rows={3} />
            ) : brands.length === 0 ? (
              <div className="glass-panel empty-card">
                <p style={{ color: 'var(--text-secondary)' }}>No brands configured yet. Click "Add New Brand" to begin.</p>
              </div>
            ) : (
              <div className="glass-panel portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Brand Name</th>
                      <th>Represented By</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.id}>
                        <td>
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="brand-logo-preview" />
                          ) : (
                            <div className="brand-logo-placeholder"><ImageIcon size={16} /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{brand.name}</td>
                        <td>
                          {brand.manufacturer_company ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {brand.manufacturer_company}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassociated</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {brand.description || '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="icon-action-btn edit" onClick={() => openBrandModal(brand)} title="Edit Brand">
                              <Edit size={16} />
                            </button>
                            <button className="icon-action-btn delete" onClick={() => handleDeleteBrand(brand.id, brand.name)} title="Delete Brand">
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
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            {approvalError && <div className="errorBanner animate-slide-in"><AlertCircle size={18} /> {approvalError}</div>}
            {approvalSuccess && <div className="successBanner animate-slide-in"><Check size={18} /> {approvalSuccess}</div>}

            <h2>Manufacturer Registrations ({manufacturers.length})</h2>

            {mLoading ? (
              <TableSkeleton cols={6} rows={3} />
            ) : manufacturers.length === 0 ? (
              <div className="glass-panel empty-card">
                <p style={{ color: 'var(--text-secondary)' }}>No manufacturer registration records found.</p>
              </div>
            ) : (
              <div className="glass-panel portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Company Details</th>
                      <th>Registration ID</th>
                      <th>User Account</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturers.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 700 }}>{m.brand_name}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{m.company_name}</span>
                            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Registered: {new Date(m.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{m.registration_number}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{m.username}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${m.status === 'approved' ? 'approved' : m.status === 'pending' ? 'pending' : 'rejected'}`}>
                            {m.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
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

        {/* Tab 4: VEHICLE UPLOADS REVIEW */}
        {activeTab === 'vehicles' && (
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            {approvalError && <div className="errorBanner animate-slide-in"><AlertCircle size={18} /> {approvalError}</div>}
            {approvalSuccess && <div className="successBanner animate-slide-in"><Check size={18} /> {approvalSuccess}</div>}

            <h2>Pending Vehicle Listings ({pendingVehicles.length})</h2>

            {pvLoading ? (
              <TableSkeleton cols={6} rows={3} />
            ) : pendingVehicles.length === 0 ? (
              <div className="glass-panel empty-card">
                <p style={{ color: 'var(--text-secondary)' }}>No pending vehicle listings waiting for review.</p>
              </div>
            ) : (
              <div className="glass-panel portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Model Name</th>
                      <th>Brand</th>
                      <th>Type & Category</th>
                      <th>Price Range</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVehicles.map((v) => (
                      <tr key={v.id}>
                        <td>
                          {v.primary_image ? (
                            <img src={v.primary_image} alt={v.name} className="vehicle-banner-preview" />
                          ) : (
                            <div className="brand-logo-placeholder"><Car size={16} /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{v.name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{v.brand_name}</td>
                        <td>{v.type.toUpperCase()} ({v.body_type})</td>
                        <td>
                          {v.min_price ? (
                            `$${parseFloat(v.min_price).toLocaleString()} - $${parseFloat(v.max_price).toLocaleString()}`
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}
                              onClick={() => handleVehicleStatus(v.id, 'approved')}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleVehicleStatus(v.id, 'rejected')}
                            >
                              <X size={14} /> Reject
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

        {/* BRANDS CRUD MODAL CONTAINER */}
        {showBrandModal && (
          <div className="modal-backdrop">
            <div className="glass-panel modal-card animate-slide-in">
              <div className="modal-header">
                <h2>{currentBrand ? 'Edit Brand Record' : 'Add Catalog Brand'}</h2>
                <button className="modal-close-btn" onClick={() => setShowBrandModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {brandError && <div className="errorBanner"><AlertCircle size={18} /> {brandError}</div>}
              {brandSuccess && <div className="successBanner"><Check size={18} /> {brandSuccess}</div>}

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

                <div className="modal-actions">
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

export default AdminDashboard;
