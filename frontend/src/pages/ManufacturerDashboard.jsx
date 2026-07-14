import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import PortalLayout from '../layouts/PortalLayout';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import './ManufacturerDashboard.css'; // Manufacturer specific styles
import { 
  CheckCircle, 
  ShieldAlert, 
  Car, 
  Eye, 
  Heart, 
  Star,
  Plus,
  Sparkles,
  Sliders,
  Trash2,
  Edit2,
  Upload,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';

const ManufacturerDashboard = () => {
  const { user, manufacturerDetails } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Vehicles list states
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Vehicle details for variant/color submanager

  // Notification banners states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Vehicle Wizard States
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);

  // Wizard Fields
  const [coreForm, setCoreForm] = useState({
    name: '',
    type: 'car',
    bodyType: 'SUV',
    description: ''
  });
  const [specsForm, setSpecsForm] = useState({
    seatingCapacity: '5',
    groundClearance: '',
    seatHeight: '',
    weight: '',
    warranty: '',
    pros: '',
    cons: ''
  });
  const [variantForm, setVariantForm] = useState({
    name: 'Base',
    price: '',
    transmission: 'manual',
    fuelType: 'petrol',
    engineCapacity: '',
    power: '',
    torque: '',
    mileage: ''
  });
  const [vehicleImages, setVehicleImages] = useState([]); // Array of File objects

  // Sub-Manager states (Variants & Colors editing)
  const [subTab, setSubTab] = useState('variants'); // 'variants' or 'colors'
  const [variantPriceEditId, setVariantPriceEditId] = useState(null);
  const [variantPriceEditVal, setVariantPriceEditVal] = useState('');
  const [addingVariant, setAddingVariant] = useState(false);
  const [newVariantForm, setNewVariantForm] = useState({
    name: '', price: '', transmission: 'manual', fuelType: 'petrol',
    engineCapacity: '', power: '', torque: '', mileage: '',
    seatingCapacity: '5', groundClearance: '', seatHeight: '', weight: '', warranty: ''
  });

  const [addingColor, setAddingColor] = useState(false);
  const [newColorForm, setNewColorForm] = useState({ color_name: '', color_code: '' });
  const [colorImageFile, setColorImageFile] = useState(null);

  const isApproved = manufacturerDetails?.status === 'approved';

  // Fetch list of brand vehicles
  const fetchVehicles = async () => {
    if (!isApproved) return;
    try {
      setLoadingVehicles(true);
      const res = await api.get('/vehicles/manufacturer/list');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load vehicle catalog.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isApproved]);

  // Handle Wizard Submission
  const handleWizardSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSubmittingVehicle(true);

    try {
      const formData = new FormData();
      formData.append('name', coreForm.name);
      formData.append('type', coreForm.type);
      formData.append('bodyType', coreForm.bodyType);
      formData.append('description', coreForm.description);

      // Pack default variant
      const defaultVariant = {
        name: variantForm.name,
        price: variantForm.price,
        transmission: variantForm.transmission,
        fuelType: variantForm.fuelType,
        engineCapacity: variantForm.engineCapacity,
        power: variantForm.power,
        torque: variantForm.torque,
        mileage: variantForm.mileage,
        seatingCapacity: specsForm.seatingCapacity,
        groundClearance: specsForm.groundClearance,
        seatHeight: specsForm.seatHeight,
        weight: specsForm.weight,
        warranty: specsForm.warranty
      };
      formData.append('variants', JSON.stringify([defaultVariant]));

      // Pack custom specifications as category/key/value pairs
      const specs = [];
      if (specsForm.groundClearance) specs.push({ category: 'Dimensions', spec_key: 'Ground Clearance', spec_value: `${specsForm.groundClearance} mm` });
      if (specsForm.seatHeight) specs.push({ category: 'Dimensions', spec_key: 'Seat Height', spec_value: `${specsForm.seatHeight} mm` });
      if (specsForm.weight) specs.push({ category: 'Weight', spec_key: 'Weight', spec_value: `${specsForm.weight} kg` });
      if (specsForm.warranty) specs.push({ category: 'Warranty', spec_key: 'Warranty Period', spec_value: specsForm.warranty });
      if (specsForm.pros) specs.push({ category: 'Pros & Cons', spec_key: 'Pros', spec_value: specsForm.pros });
      if (specsForm.cons) specs.push({ category: 'Pros & Cons', spec_key: 'Cons', spec_value: specsForm.cons });
      
      formData.append('specifications', JSON.stringify(specs));

      // Append upload images
      vehicleImages.forEach((image) => {
        formData.append('images', image);
      });

      const res = await api.post('/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg(res.data.message);
      fetchVehicles();
      resetWizard();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload vehicle listing.');
    } finally {
      setSubmittingVehicle(false);
    }
  };

  const resetWizard = () => {
    setShowAddWizard(false);
    setWizardStep(1);
    setCoreForm({ name: '', type: 'car', bodyType: 'SUV', description: '' });
    setSpecsForm({ seatingCapacity: '5', groundClearance: '', seatHeight: '', weight: '', warranty: '', pros: '', cons: '' });
    setVariantForm({ name: 'Base', price: '', transmission: 'manual', fuelType: 'petrol', engineCapacity: '', power: '', torque: '', mileage: '' });
    setVehicleImages([]);
  };

  // Fetch full details when editing variants/colors
  const openSubManager = async (vehicleId) => {
    try {
      const res = await api.get(`/vehicles/${vehicleId}`);
      setSelectedVehicle(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch vehicle profile.');
    }
  };

  // Add Variant
  const handleAddVariant = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post(`/vehicles/${selectedVehicle.id}/variants`, newVariantForm);
      setSuccessMsg('Variant created successfully.');
      setAddingVariant(false);
      setNewVariantForm({
        name: '', price: '', transmission: 'manual', fuelType: 'petrol',
        engineCapacity: '', power: '', torque: '', mileage: '',
        seatingCapacity: '5', groundClearance: '', seatHeight: '', weight: '', warranty: ''
      });
      openSubManager(selectedVehicle.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add variant.');
    }
  };

  // Update Variant Price
  const handleUpdatePrice = async (variantId) => {
    setErrorMsg('');
    try {
      const variantToEdit = selectedVehicle.variants.find(v => v.id === variantId);
      const updatedDetails = {
        ...variantToEdit,
        price: variantPriceEditVal
      };
      
      await api.put(`/vehicles/${selectedVehicle.id}/variants/${variantId}`, updatedDetails);
      setSuccessMsg('Variant price updated successfully.');
      setVariantPriceEditId(null);
      openSubManager(selectedVehicle.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update price.');
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId) => {
    setErrorMsg('');
    try {
      await api.delete(`/vehicles/${selectedVehicle.id}/variants/${variantId}`);
      setSuccessMsg('Variant deleted successfully.');
      openSubManager(selectedVehicle.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete variant.');
    }
  };

  // Add Color swatch
  const handleAddColor = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const formData = new FormData();
      formData.append('color_name', newColorForm.color_name);
      formData.append('color_code', newColorForm.color_code);
      if (colorImageFile) {
        formData.append('colorImage', colorImageFile);
      }

      await api.post(`/vehicles/${selectedVehicle.id}/colors`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Color swatch added successfully.');
      setAddingColor(false);
      setNewColorForm({ color_name: '', color_code: '' });
      setColorImageFile(null);
      openSubManager(selectedVehicle.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add color.');
    }
  };

  // Delete Color swatch
  const handleDeleteColor = async (colorId) => {
    setErrorMsg('');
    try {
      await api.delete(`/vehicles/${selectedVehicle.id}/colors/${colorId}`);
      setSuccessMsg('Color swatch deleted successfully.');
      openSubManager(selectedVehicle.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete color.');
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id, name) => {
    setErrorMsg('');
    try {
      const res = await api.delete(`/vehicles/${id}`);
      setSuccessMsg(res.data.message);
      fetchVehicles();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  // If pending or rejected, render simple notice layout
  if (!isApproved) {
    const isRejected = manufacturerDetails?.status === 'rejected';
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '45vh', marginTop: '2rem', boxShadow: 'var(--shadow-md)' }}>
        {isRejected ? (
          <ShieldAlert size={56} color="var(--error)" style={{ marginBottom: '1rem' }} />
        ) : (
          <ShieldAlert size={56} color="var(--warning)" style={{ marginBottom: '1rem' }} />
        )}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Partner Portal Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', maxWidth: '550px', textAlign: 'center', lineHeight: 1.6, fontSize: '0.95rem' }}>
          {isRejected ? (
            `Your brand partner registration request for "${manufacturerDetails?.brand_name || 'your brand'}" has been rejected by an administrator. Please contact our support team at administration@findride.com for details.`
          ) : (
            `Your brand partner registration request for "${manufacturerDetails?.brand_name || 'your brand'}" is currently PENDING review. Our team is verifying your registration number "${manufacturerDetails?.registration_number || 'ID'}". This dashboard will unlock once approved.`
          )}
        </p>
      </div>
    );
  }

  return (
    <PortalLayout role="manufacturer" activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-container animate-fade-in">
        
        {/* Header */}
        <div className="portal-header">
          <h1>Partner Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Workspace for {manufacturerDetails.company_name} representing brand **{manufacturerDetails.brand_name}**
          </p>
        </div>

        {/* Global Notifications */}
        {successMsg && <div className="successBanner animate-slide-in"><CheckCircle size={18} /> {successMsg}</div>}
        {errorMsg && <div className="errorBanner animate-slide-in"><AlertCircle size={18} /> {errorMsg}</div>}

        {/* Tab 1: OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            {/* Overview Stats */}
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <Car size={24} color="var(--primary)" />
                <div>
                  <h3 className="stat-card-value">{vehicles.length}</h3>
                  <p className="stat-card-label">Active Vehicles</p>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <Eye size={24} color="var(--accent)" />
                <div>
                  <h3 className="stat-card-value">0</h3>
                  <p className="stat-card-label">Total Views</p>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <Heart size={24} color="var(--error)" />
                <div>
                  <h3 className="stat-card-value">0</h3>
                  <p className="stat-card-label">User Favorites</p>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <Star size={24} color="var(--warning)" />
                <div>
                  <h3 className="stat-card-value">0.0</h3>
                  <p className="stat-card-label">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Welcome message */}
            <div className="glass-panel activity-card">
              <Sparkles size={28} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Welcome to Find Ride Workspace</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
                Your brand portal is approved and active. Go to the **Vehicle Manager** tab in the sidebar to upload vehicle listings, define variant specifications, and configure color palettes.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: VEHICLE INVENTORY MANAGER */}
        {activeTab === 'vehicles' && !selectedVehicle && !showAddWizard && (
          <div className="portal-container" style={{ gap: '1.5rem' }}>
            <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Inventory Vehicles ({vehicles.length})</h2>
              <button className="btn btn-primary" onClick={() => setShowAddWizard(true)}>
                <Plus size={18} /> Add New Vehicle
              </button>
            </div>

            {loadingVehicles ? (
              <TableSkeleton cols={5} rows={3} />
            ) : vehicles.length === 0 ? (
              <div className="glass-panel empty-card">
                <p style={{ color: 'var(--text-secondary)' }}>No vehicles uploaded yet. Click "Add New Vehicle" to begin.</p>
              </div>
            ) : (
              <div className="glass-panel portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Model Name</th>
                      <th>Category</th>
                      <th>Price Range</th>
                      <th>Status</th>
                      <th>Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td>
                          {v.primary_image ? (
                            <img src={v.primary_image} alt={v.name} className="vehicle-banner-preview" />
                          ) : (
                            <div className="brand-logo-placeholder"><Car size={16} /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{v.name}</td>
                        <td>{v.type.toUpperCase()} ({v.body_type})</td>
                        <td>
                          {v.min_price ? (
                            `$${parseFloat(v.min_price).toLocaleString()} - $${parseFloat(v.max_price).toLocaleString()}`
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${v.status === 'approved' ? 'approved' : v.status === 'pending' ? 'pending' : 'rejected'}`}>
                            {v.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => openSubManager(v.id)}
                            >
                              <Sliders size={14} /> Specs & Colors
                            </button>
                            <button 
                              className="icon-action-btn delete" 
                              onClick={() => handleDeleteVehicle(v.id, v.name)}
                              title="Delete Vehicle"
                            >
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

        {/* ADD VEHICLE MULTI-STEP WIZARD */}
        {showAddWizard && (
          <div className="glass-panel activity-card animate-slide-in">
            <div className="wizard-header">
              <h2>Upload Vehicle Listing</h2>
              <span className="wizard-step-badge">Step {wizardStep} of 4</span>
            </div>

            {/* Step Content */}
            <div style={{ margin: '2rem 0' }}>
              
              {/* Step 1: Core Details */}
              {wizardStep === 1 && (
                <div className="animate-fade-in wizard-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicle-name">Vehicle Model Name</label>
                    <input
                      id="vehicle-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Model Y, Prius, CB350"
                      value={coreForm.name}
                      onChange={(e) => setCoreForm({ ...coreForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicle-type">Vehicle Type</label>
                    <select
                      id="vehicle-type"
                      className="form-input"
                      value={coreForm.type}
                      onChange={(e) => setCoreForm({ ...coreForm, type: e.target.value })}
                    >
                      <option value="car">Car</option>
                      <option value="bike">Motorcycle</option>
                      <option value="scooter">Scooter</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicle-body">Body Style / Category</label>
                    <input
                      id="vehicle-body"
                      type="text"
                      className="form-input"
                      placeholder="e.g. SUV, Cruiser, Sedan, Sports"
                      value={coreForm.bodyType}
                      onChange={(e) => setCoreForm({ ...coreForm, bodyType: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="vehicle-desc">Vehicle Description</label>
                    <textarea
                      id="vehicle-desc"
                      className="form-input"
                      rows={3}
                      placeholder="Write a brief overview describing the vehicle highlight features..."
                      value={coreForm.description}
                      onChange={(e) => setCoreForm({ ...coreForm, description: e.target.value })}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Dimensions & Warranties */}
              {wizardStep === 2 && (
                <div className="animate-fade-in wizard-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="seating-cap">Seating Capacity</label>
                    <input
                      id="seating-cap"
                      type="number"
                      className="form-input"
                      value={specsForm.seatingCapacity}
                      onChange={(e) => setSpecsForm({ ...specsForm, seatingCapacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ground-clear">Ground Clearance (mm)</label>
                    <input
                      id="ground-clear"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 170"
                      value={specsForm.groundClearance}
                      onChange={(e) => setSpecsForm({ ...specsForm, groundClearance: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="seat-height">Seat Height (mm) (Bikes only)</label>
                    <input
                      id="seat-height"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 800"
                      value={specsForm.seatHeight}
                      onChange={(e) => setSpecsForm({ ...specsForm, seatHeight: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="weight-kg">Total Weight (kg)</label>
                    <input
                      id="weight-kg"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1500"
                      value={specsForm.weight}
                      onChange={(e) => setSpecsForm({ ...specsForm, weight: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="warranty-desc">Warranty Period</label>
                    <input
                      id="warranty-desc"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3 years or 100,000 km"
                      value={specsForm.warranty}
                      onChange={(e) => setSpecsForm({ ...specsForm, warranty: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="vehicle-pros">Key Pros (Comma-separated)</label>
                    <input
                      id="vehicle-pros"
                      type="text"
                      className="form-input"
                      placeholder="Comfortable Cabin, Great Fuel Economy"
                      value={specsForm.pros}
                      onChange={(e) => setSpecsForm({ ...specsForm, pros: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="vehicle-cons">Key Cons (Comma-separated)</label>
                    <input
                      id="vehicle-cons"
                      type="text"
                      className="form-input"
                      placeholder="Noisy Cabin on Highways, Average Headlights"
                      value={specsForm.cons}
                      onChange={(e) => setSpecsForm({ ...specsForm, cons: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Default Variant configuration */}
              {wizardStep === 3 && (
                <div className="animate-fade-in wizard-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="var-name">Base Variant Name</label>
                    <input
                      id="var-name"
                      type="text"
                      className="form-input"
                      value={variantForm.name}
                      onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-price">Base Price ($)</label>
                    <input
                      id="var-price"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 35000"
                      value={variantForm.price}
                      onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-trans">Transmission Type</label>
                    <select
                      id="var-trans"
                      className="form-input"
                      value={variantForm.transmission}
                      onChange={(e) => setVariantForm({ ...variantForm, transmission: e.target.value })}
                    >
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="semi-automatic">Semi-Automatic</option>
                      <option value="none">None (Electric Drive)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-fuel">Fuel Type</label>
                    <select
                      id="var-fuel"
                      className="form-input"
                      value={variantForm.fuelType}
                      onChange={(e) => setVariantForm({ ...variantForm, fuelType: e.target.value })}
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="cng">CNG</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-eng">Engine Capacity (cc)</label>
                    <input
                      id="var-eng"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1998"
                      value={variantForm.engineCapacity}
                      onChange={(e) => setVariantForm({ ...variantForm, engineCapacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-power">Max Power (bhp)</label>
                    <input
                      id="var-power"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 150 bhp @ 6000 rpm"
                      value={variantForm.power}
                      onChange={(e) => setVariantForm({ ...variantForm, power: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-torque">Max Torque (Nm)</label>
                    <input
                      id="var-torque"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 250 Nm @ 4400 rpm"
                      value={variantForm.torque}
                      onChange={(e) => setVariantForm({ ...variantForm, torque: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="var-mile">Fuel Economy / Mileage</label>
                    <input
                      id="var-mile"
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 15.6 (kmpl or km/charge)"
                      value={variantForm.mileage}
                      onChange={(e) => setVariantForm({ ...variantForm, mileage: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Images file uploader */}
              {wizardStep === 4 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="wizard-upload-box">
                    <Upload size={32} color="var(--primary)" />
                    <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Select Showcase Product Images</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      PNG, JPG, WEBP, or SVG files up to 5MB are allowed. (Up to 5 files).
                    </p>
                    <input
                      id="vehicle-images-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setVehicleImages(Array.from(e.target.files))}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>

                  {vehicleImages.length > 0 && (
                    <div className="wizard-upload-list">
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Selected Files ({vehicleImages.length}):
                      </p>
                      {vehicleImages.map((file, i) => (
                        <div key={i} className="wizard-upload-item">
                          <FileText size={16} />
                          <span style={{ fontSize: '0.85rem', flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={resetWizard} disabled={submittingVehicle}>
                Cancel
              </button>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                {wizardStep > 1 && (
                  <button className="btn btn-secondary" onClick={() => setWizardStep(wizardStep - 1)} disabled={submittingVehicle}>
                    <ChevronLeft size={16} /> Back
                  </button>
                )}

                {wizardStep < 4 ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      if (wizardStep === 1 && !coreForm.name.trim()) {
                        setErrorMsg('Vehicle Model Name is required.');
                        return;
                      }
                      if (wizardStep === 3 && (!variantForm.name.trim() || !variantForm.price)) {
                        setErrorMsg('Variant name and price are required.');
                        return;
                      }
                      setErrorMsg('');
                      setWizardStep(wizardStep + 1);
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleWizardSubmit}
                    disabled={submittingVehicle}
                  >
                    {submittingVehicle ? <div className="spinner"></div> : 'Publish Listing'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VARIANTS & COLORS SUB-MANAGER DETAIL SCREEN */}
        {selectedVehicle && (
          <div className="glass-panel activity-card animate-fade-in">
            <div className="modal-header">
              <div>
                <h2>{selectedVehicle.name} Configuration</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Manage price trims and color representations for this model
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => { setSelectedVehicle(null); fetchVehicles(); }}>
                Back to Inventory List
              </button>
            </div>

            {/* Switch tabs */}
            <div className="submanager-tabs-bar">
              <button
                type="button"
                className="submanager-tab-btn"
                style={{
                  borderBottomColor: subTab === 'variants' ? 'var(--primary)' : 'transparent',
                  color: subTab === 'variants' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
                onClick={() => { setSubTab('variants'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Model Variants
              </button>
              <button
                type="button"
                className="submanager-tab-btn"
                style={{
                  borderBottomColor: subTab === 'colors' ? 'var(--primary)' : 'transparent',
                  color: subTab === 'colors' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
                onClick={() => { setSubTab('colors'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Color Swatches
              </button>
            </div>

            {/* SUB-TAB 1: VARIANTS PANEL */}
            {subTab === 'variants' && !addingVariant && (
              <div className="portal-container" style={{ gap: '1.5rem' }}>
                <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Variants Trims ({selectedVehicle.variants?.length})</h3>
                  <button className="btn btn-primary" onClick={() => setAddingVariant(true)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Variant Trim
                  </button>
                </div>

                <div className="portal-table-container">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Variant Name</th>
                        <th>Price</th>
                        <th>Specs</th>
                        <th>Fuel/Drive</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVehicle.variants?.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 700 }}>{v.name}</td>
                          <td>
                            {variantPriceEditId === v.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ padding: '0.25rem', width: '100px' }}
                                  value={variantPriceEditVal}
                                  onChange={(e) => setVariantPriceEditVal(e.target.value)}
                                  required
                                />
                                <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleUpdatePrice(v.id)}>Save</button>
                                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setVariantPriceEditId(null)}>Cancel</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>${parseFloat(v.price).toLocaleString()}</span>
                                <button 
                                  className="icon-action-btn edit" 
                                  onClick={() => { setVariantPriceEditId(v.id); setVariantPriceEditVal(v.price); }}
                                  title="Edit Price"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <div>Engine: {v.engine_capacity ? `${v.engine_capacity} cc` : 'N/A'}</div>
                              <div>Power: {v.power || 'N/A'}</div>
                              <div>Torque: {v.torque || 'N/A'}</div>
                            </div>
                          </td>
                          <td>{v.transmission} / {v.fuel_type}</td>
                          <td>
                            <button 
                              className="icon-action-btn delete" 
                              onClick={() => handleDeleteVariant(v.id)}
                              title="Delete Variant"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Form: Add Variant */}
            {subTab === 'variants' && addingVariant && (
              <div className="glass-panel activity-card animate-slide-in" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3>Add Variant Trim</h3>
                <form onSubmit={handleAddVariant} className="wizard-grid" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-name">Variant Name</label>
                    <input
                      id="new-var-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. VXI, Touring, Premium"
                      value={newVariantForm.name}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-price">Price ($)</label>
                    <input
                      id="new-var-price"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 40000"
                      value={newVariantForm.price}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-trans">Transmission</label>
                    <select
                      id="new-var-trans"
                      className="form-input"
                      value={newVariantForm.transmission}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, transmission: e.target.value })}
                    >
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="semi-automatic">Semi-Automatic</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-fuel">Fuel Type</label>
                    <select
                      id="new-var-fuel"
                      className="form-input"
                      value={newVariantForm.fuelType}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, fuelType: e.target.value })}
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="cng">CNG</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-eng">Engine Capacity (cc)</label>
                    <input
                      id="new-var-eng"
                      type="number"
                      className="form-input"
                      value={newVariantForm.engineCapacity}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, engineCapacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-power">Max Power</label>
                    <input
                      id="new-var-power"
                      type="text"
                      className="form-input"
                      placeholder="180 bhp"
                      value={newVariantForm.power}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, power: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-torque">Max Torque</label>
                    <input
                      id="new-var-torque"
                      type="text"
                      className="form-input"
                      placeholder="300 Nm"
                      value={newVariantForm.torque}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, torque: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-var-mile">Mileage</label>
                    <input
                      id="new-var-mile"
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={newVariantForm.mileage}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, mileage: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setAddingVariant(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Variant</button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-TAB 2: COLORS PANEL */}
            {subTab === 'colors' && !addingColor && (
              <div className="portal-container" style={{ gap: '1.5rem' }}>
                <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Color Options Swatches ({selectedVehicle.colors?.length})</h3>
                  <button className="btn btn-primary" onClick={() => setAddingColor(true)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Color Swatch
                  </button>
                </div>

                <div className="portal-table-container">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Color Palette</th>
                        <th>Color Name</th>
                        <th>HEX Code</th>
                        <th>Associated Image</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVehicle.colors?.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: c.color_code,
                              border: '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-sm)'
                            }}></div>
                          </td>
                          <td style={{ fontWeight: 700 }}>{c.color_name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{c.color_code}</td>
                          <td>
                            {c.image_url ? (
                              <img src={c.image_url} alt={c.color_name} style={{ height: '32px', borderRadius: '4px' }} />
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No custom image</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="icon-action-btn delete" 
                              onClick={() => handleDeleteColor(c.id)}
                              title="Delete Color"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Form: Add Color */}
            {subTab === 'colors' && addingColor && (
              <div className="glass-panel activity-card animate-slide-in" style={{ backgroundColor: 'var(--bg-tertiary)', maxWidth: '480px' }}>
                <h3>Add Color swatch</h3>
                <form onSubmit={handleAddColor} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-color-name">Color Name</label>
                    <input
                      id="new-color-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Crimson Red, Cosmic Silver"
                      value={newColorForm.color_name}
                      onChange={(e) => setNewColorForm({ ...newColorForm, color_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-color-code">Color HEX Code</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        id="new-color-code"
                        type="text"
                        className="form-input"
                        placeholder="e.g. #FF0000"
                        value={newColorForm.color_code}
                        onChange={(e) => setNewColorForm({ ...newColorForm, color_code: e.target.value })}
                        required
                      />
                      <input
                        type="color"
                        value={newColorForm.color_code.startsWith('#') && newColorForm.color_code.length === 7 ? newColorForm.color_code : '#000000'}
                        onChange={(e) => setNewColorForm({ ...newColorForm, color_code: e.target.value })}
                        style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new-color-img">Color Specific Image (Optional)</label>
                    <input
                      id="new-color-img"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setColorImageFile(e.target.files[0])}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setAddingColor(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Swatch</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default ManufacturerDashboard;
