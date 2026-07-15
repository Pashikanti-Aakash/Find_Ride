import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VehicleDetail.css';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Fuel, 
  Compass, 
  Gauge, 
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'features'

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vehicles/${id}`);
        setVehicle(res.data);
        
        // Default to first variant and first image
        if (res.data.variants && res.data.variants.length > 0) {
          setActiveVariant(res.data.variants[0]);
        }
        if (res.data.images && res.data.images.length > 0) {
          const primaryImg = res.data.images.find(img => img.is_primary) || res.data.images[0];
          setActiveImage(primaryImg);
        }
      } catch (err) {
        console.error('Error fetching vehicle details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!vehicle) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2>Vehicle Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          This listing might have been removed or rejected by the administration.
        </p>
        <button onClick={() => navigate('/vehicles')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Determine main image URL to display
  // Swaps automatically if a swatch is clicked and has a dedicated picture,
  // otherwise defaults to thumbnail selected image, otherwise fallback.
  const getMainImageUrl = () => {
    if (activeColor && activeColor.image_url) {
      return activeColor.image_url;
    }
    if (activeImage) {
      return activeImage.image_url;
    }
    return '';
  };

  const handleColorClick = (color) => {
    // If clicked the active color, toggle off to show standard images
    if (activeColor && activeColor.id === color.id) {
      setActiveColor(null);
    } else {
      setActiveColor(color);
    }
  };

  // Group specs by category block
  const getSpecsByCategory = () => {
    if (!vehicle.specifications) return {};
    return vehicle.specifications.reduce((groups, spec) => {
      const cat = spec.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(spec);
      return groups;
    }, {});
  };

  const specsByCategory = getSpecsByCategory();

  return (
    <div className="detail-container animate-fade-in">
      {/* Back to Browse row */}
      <div onClick={() => navigate('/vehicles')} className="detail-header-back">
        <ArrowLeft size={16} /> Back to Browse
      </div>

      <div className="detail-layout-grid">
        {/* Left Side - Swatches visualizer & Thumbnails */}
        <div className="detail-visualizer-panel">
          <div className="glass-panel detail-main-image-container">
            {getMainImageUrl() ? (
              <img 
                src={getMainImageUrl()} 
                alt={vehicle.name} 
                className="detail-main-image"
              />
            ) : (
              <div className="brand-logo-placeholder" style={{ width: '80px', height: '60px' }}>
                <Car size={48} />
              </div>
            )}
          </div>

          {/* Primary images thumbnails gallery (only show if not visualizing a swatch image) */}
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="detail-thumbnails-row">
              {vehicle.images.map((img) => (
                <div 
                  key={img.id}
                  className={`detail-thumbnail-item ${activeImage?.id === img.id && !activeColor ? 'active' : ''}`}
                  onClick={() => {
                    setActiveImage(img);
                    setActiveColor(null); // Clear swatch visualizer
                  }}
                >
                  <img 
                    src={img.image_url} 
                    alt="Thumbnail" 
                    className="detail-thumbnail-img"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Swatches selector block */}
          {vehicle.colors && vehicle.colors.length > 0 && (
            <div className="detail-swatches-section">
              <h4 className="detail-swatches-title">Select Color Swatch</h4>
              <div className="detail-swatches-row">
                {vehicle.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`detail-swatch-btn ${activeColor?.id === color.id ? 'active' : ''}`}
                    onClick={() => handleColorClick(color)}
                  >
                    <div 
                      className="detail-swatch-dot"
                      style={{ backgroundColor: color.color_code }}
                    ></div>
                    <span>{color.color_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Dynamic Specs summary & Variant toggle */}
        <div className="detail-info-panel">
          <div className="detail-brand-title-row">
            <span className="detail-brand-badge">{vehicle.brand_name}</span>
            <h1 className="detail-title">{vehicle.name}</h1>
          </div>

          <div className="detail-type-row">
            <span className="detail-type-badge">{vehicle.type}</span>
            <span className="detail-type-badge">{vehicle.body_type}</span>
          </div>

          <p className="detail-desc">
            {vehicle.description || `Explore specifications, available variants, colors, and capabilities of the ${vehicle.brand_name} ${vehicle.name}.`}
          </p>

          {/* Dynamic variants toggles list */}
          {vehicle.variants && vehicle.variants.length > 0 && (
            <div className="detail-variant-section">
              <h4 className="detail-variant-title">Choose Variant Specs</h4>
              <div className="detail-variants-list">
                {vehicle.variants.map((v) => (
                  <div
                    key={v.id}
                    className={`detail-variant-item ${activeVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => setActiveVariant(v)}
                  >
                    <span className="detail-variant-name">{v.name}</span>
                    <span className="detail-variant-price">{formatPrice(v.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic specifications summary cards */}
          {activeVariant && (
            <div className="glass-panel detail-quick-specs-grid">
              <div className="detail-spec-box">
                <Fuel size={20} color="var(--primary)" />
                <span className="detail-spec-box-label">Fuel</span>
                <span className="detail-spec-box-val" style={{ textTransform: 'capitalize' }}>
                  {activeVariant.fuel_type}
                </span>
              </div>

              <div className="detail-spec-box">
                <Compass size={20} color="var(--primary)" />
                <span className="detail-spec-box-label">Transmission</span>
                <span className="detail-spec-box-val" style={{ textTransform: 'capitalize' }}>
                  {activeVariant.transmission}
                </span>
              </div>

              {activeVariant.engine_capacity && (
                <div className="detail-spec-box">
                  <Gauge size={20} color="var(--primary)" />
                  <span className="detail-spec-box-label">Engine</span>
                  <span className="detail-spec-box-val">
                    {activeVariant.engine_capacity} cc
                  </span>
                </div>
              )}

              {activeVariant.mileage && (
                <div className="detail-spec-box">
                  <Zap size={20} color="var(--primary)" />
                  <span className="detail-spec-box-label">Mileage</span>
                  <span className="detail-spec-box-val">
                    {activeVariant.mileage} km/l
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs segment: full technical specs vs standard features list */}
      <div className="detail-tabs-bar">
        <button
          type="button"
          className={`detail-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
          onClick={() => setActiveTab('specs')}
        >
          Technical Specifications
        </button>
        <button
          type="button"
          className={`detail-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Features Checklist
        </button>
      </div>

      {/* Dynamic Tab Body content */}
      <div className="detail-tab-body">
        {activeTab === 'specs' ? (
          <div className="detail-specs-content">
            {/* Core active variant specs if available */}
            {activeVariant && (
              <div className="detail-spec-category-block">
                <h4 className="detail-spec-category-title">Core Performance Details</h4>
                <table className="detail-spec-table">
                  <tbody>
                    {activeVariant.power && (
                      <tr>
                        <td className="detail-spec-table-key">Maximum Power Output</td>
                        <td className="detail-spec-table-val">{activeVariant.power}</td>
                      </tr>
                    )}
                    {activeVariant.torque && (
                      <tr>
                        <td className="detail-spec-table-key">Maximum Torque Output</td>
                        <td className="detail-spec-table-val">{activeVariant.torque}</td>
                      </tr>
                    )}
                    {activeVariant.seating_capacity && (
                      <tr>
                        <td className="detail-spec-table-key">Seating Capacity</td>
                        <td className="detail-spec-table-val">{activeVariant.seating_capacity} Persons</td>
                      </tr>
                    )}
                    {activeVariant.fuel_tank_capacity && (
                      <tr>
                        <td className="detail-spec-table-key">Fuel Tank Volume</td>
                        <td className="detail-spec-table-val">{activeVariant.fuel_tank_capacity} L</td>
                      </tr>
                    )}
                    {activeVariant.ground_clearance && (
                      <tr>
                        <td className="detail-spec-table-key">Min Ground Clearance</td>
                        <td className="detail-spec-table-val">{activeVariant.ground_clearance} mm</td>
                      </tr>
                    )}
                    {activeVariant.seat_height && (
                      <tr>
                        <td className="detail-spec-table-key">Saddle Seat Height</td>
                        <td className="detail-spec-table-val">{activeVariant.seat_height} mm</td>
                      </tr>
                    )}
                    {activeVariant.weight && (
                      <tr>
                        <td className="detail-spec-table-key">Curb Weight</td>
                        <td className="detail-spec-table-val">{activeVariant.weight} kg</td>
                      </tr>
                    )}
                    {activeVariant.warranty && (
                      <tr>
                        <td className="detail-spec-table-key">Manufacturer Warranty</td>
                        <td className="detail-spec-table-val">{activeVariant.warranty}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Custom key-value specification groups */}
            {Object.keys(specsByCategory).length > 0 ? (
              Object.keys(specsByCategory).map((categoryName) => (
                <div key={categoryName} className="detail-spec-category-block">
                  <h4 className="detail-spec-category-title">{categoryName}</h4>
                  <table className="detail-spec-table">
                    <tbody>
                      {specsByCategory[categoryName].map((spec) => (
                        <tr key={spec.id}>
                          <td className="detail-spec-table-key">{spec.spec_key}</td>
                          <td className="detail-spec-table-val">{spec.spec_value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              !activeVariant && <p style={{ color: 'var(--text-muted)' }}>No additional specifications entered.</p>
            )}
          </div>
        ) : (
          /* Features tab */
          <div className="detail-features-grid">
            {vehicle.features && vehicle.features.length > 0 ? (
              vehicle.features.map((feat) => (
                <div 
                  key={feat.id} 
                  className={`detail-feature-item ${feat.is_standard ? 'standard' : 'optional'}`}
                >
                  {feat.is_standard ? (
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span>
                    {feat.feature_name} {!feat.is_standard && <small style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</small>}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No convenience or safety features checklist specified.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
