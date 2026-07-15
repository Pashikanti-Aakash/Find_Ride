import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Compare.css';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  GitCompare, 
  ArrowLeft, 
  X, 
  Check, 
  Minus,
  AlertCircle
} from 'lucide-react';

const Compare = () => {
  const navigate = useNavigate();

  // Selected compare vehicle IDs from localStorage
  const [compareIds, setCompareIds] = useState(() => {
    const saved = localStorage.getItem('compareVehicles');
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState([]);
  const [allAvailable, setAllAvailable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('compareVehicles', JSON.stringify(compareIds));
  }, [compareIds]);

  // Fetch full details of selected vehicles in parallel + list of all vehicles for drop-down insertion
  useEffect(() => {
    const loadCompareData = async () => {
      try {
        setLoading(true);
        
        // Fetch compared vehicle profiles
        if (compareIds.length > 0) {
          const detailPromises = compareIds.map(id => api.get(`/vehicles/${id}`));
          const detailResponses = await Promise.all(detailPromises);
          setVehicles(detailResponses.map(res => res.data));
        } else {
          setVehicles([]);
        }

        // Fetch all approved vehicles to populate empty slots select option
        const catalogRes = await api.get('/vehicles');
        setAllAvailable(catalogRes.data);
      } catch (err) {
        console.error('Error fetching compare details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCompareData();
  }, [compareIds]);

  const handleRemoveVehicle = (id) => {
    const updated = compareIds.filter(vId => vId !== id);
    setCompareIds(updated);
    if (updated.length === 0) {
      localStorage.removeItem('compareType');
    }
  };

  const handleAddVehicle = (id) => {
    if (compareIds.length >= 3) {
      alert('You can compare a maximum of 3 vehicles.');
      return;
    }
    const targetId = parseInt(id);
    const targetVehicle = allAvailable.find(av => av.id === targetId);
    
    if (targetVehicle && vehicles.length > 0 && vehicles[0].type !== targetVehicle.type) {
      alert(`You can only compare vehicles of the same category. Cannot mix ${vehicles[0].type}s and ${targetVehicle.type}s.`);
      return;
    }
    
    if (compareIds.length === 0 && targetVehicle) {
      localStorage.setItem('compareType', targetVehicle.type);
    }
    
    setCompareIds([...compareIds, targetId]);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPriceRange = (v) => {
    if (!v.variants || v.variants.length === 0) return 'TBA';
    const prices = v.variants.map(varItem => varItem.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  // Compile list of unique feature names across all selected vehicles
  const getUniqueFeatures = () => {
    const list = new Set();
    vehicles.forEach(v => {
      if (v.features) {
        v.features.forEach(f => list.add(f.feature_name));
      }
    });
    return Array.from(list);
  };

  const uniqueFeatures = getUniqueFeatures();

  // Find checking feature availability
  const checkFeatureStatus = (vehicle, featureName) => {
    if (!vehicle.features) return null;
    const match = vehicle.features.find(f => f.feature_name === featureName);
    if (!match) return 'none';
    return match.is_standard ? 'standard' : 'optional';
  };

  if (loading) {
    return (
      <div className="compare-container">
        <div className="compare-header">
          <h1>Comparing Vehicles</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Render empty state if no IDs chosen
  if (compareIds.length === 0) {
    return (
      <div className="glass-panel compare-dashboard-empty animate-fade-in">
        <GitCompare size={64} color="var(--primary)" />
        <h2>Your Comparison Board is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px' }}>
          Add up to three automobiles from our catalog page to cross-examine specifications, pricing ranges, and standard features.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
          <ArrowLeft size={16} /> Go to Vehicles Catalog
        </button>
      </div>
    );
  }

  // Create columns list (fixed to 3 slots for visual alignment)
  const columns = [0, 1, 2].map(index => vehicles[index] || null);

  // List of other vehicles available to select in empty slots (restricted to the same category type)
  const comparedType = vehicles[0]?.type;
  const nonSelectedAvailable = allAvailable.filter(
    av => !compareIds.includes(av.id) && av.type === comparedType
  );

  return (
    <div className="compare-container animate-fade-in">
      <div className="compare-header">
        <div>
          <h1>Comparison Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Contrast technical details side-by-side</p>
        </div>
        <span className="compare-back-btn" onClick={() => navigate('/vehicles')}>
          <ArrowLeft size={16} /> Back to Catalog
        </span>
      </div>

      <div className="compare-grid-layout">
        {/* Row 1: Vehicle Headers / Images */}
        <div className="compare-row compare-row-header">
          <div className="compare-cell compare-cell-label">Vehicle Profile</div>
          {columns.map((colVehicle, idx) => (
            <div key={idx} className="compare-cell">
              {colVehicle ? (
                <div className="compare-vehicle-header animate-slide-in">
                  <button 
                    type="button" 
                    className="compare-remove-btn"
                    onClick={() => handleRemoveVehicle(colVehicle.id)}
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                  <div className="compare-header-img-wrapper">
                    {colVehicle.images && colVehicle.images.length > 0 ? (
                      <img 
                        src={colVehicle.images.find(img => img.is_primary)?.image_url || colVehicle.images[0].image_url} 
                        alt={colVehicle.name}
                        className="compare-header-img"
                      />
                    ) : (
                      <GitCompare size={36} color="var(--text-muted)" />
                    )}
                  </div>
                  <div className="compare-header-info">
                    <span className="compare-header-brand">{colVehicle.brand_name}</span>
                    <span className="compare-header-title">{colVehicle.name}</span>
                  </div>
                </div>
              ) : (
                /* Empty Column Placeholder slot with drop down insertion */
                <div className="compare-empty-col">
                  <AlertCircle size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Empty Slot</span>
                  {nonSelectedAvailable.length > 0 && (
                    <select
                      className="form-input compare-add-select"
                      onChange={(e) => handleAddVehicle(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add {comparedType}</option>
                      {nonSelectedAvailable.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.brand_name} {item.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Row Group 1: General Category */}
        <div className="compare-row compare-row-category-title">
          <span>General Specifications</span>
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Price Range</div>
          {columns.map((v, i) => (
            <div key={i} className="compare-cell" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {v ? getPriceRange(v) : '-'}
            </div>
          ))}
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Category Type</div>
          {columns.map((v, i) => (
            <div key={i} className="compare-cell" style={{ textTransform: 'capitalize' }}>
              {v ? `${v.type} (${v.body_type})` : '-'}
            </div>
          ))}
        </div>

        {/* Row Group 2: Tech specs */}
        <div className="compare-row compare-row-category-title">
          <span>Engine & Performance</span>
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Engine capacity</div>
          {columns.map((v, i) => {
            const firstVar = v?.variants?.[0];
            return (
              <div key={i} className="compare-cell">
                {v ? (firstVar?.engine_capacity ? `${firstVar.engine_capacity} cc` : 'N/A (Electric)') : '-'}
              </div>
            );
          })}
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Fuel Configuration</div>
          {columns.map((v, i) => {
            const uniqueFuels = Array.from(new Set(v?.variants?.map(varItem => varItem.fuel_type) || []));
            return (
              <div key={i} className="compare-cell" style={{ textTransform: 'capitalize' }}>
                {v ? uniqueFuels.join(', ') : '-'}
              </div>
            );
          })}
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Transmission Options</div>
          {columns.map((v, i) => {
            const uniqueTrans = Array.from(new Set(v?.variants?.map(varItem => varItem.transmission) || []));
            return (
              <div key={i} className="compare-cell" style={{ textTransform: 'capitalize' }}>
                {v ? uniqueTrans.map(t => t === 'none' ? 'direct drive' : t).join(', ') : '-'}
              </div>
            );
          })}
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Fuel Economy (Mileage)</div>
          {columns.map((v, i) => {
            const economy = v?.variants?.map(varItem => varItem.mileage).filter(Boolean);
            return (
              <div key={i} className="compare-cell">
                {v ? (economy && economy.length > 0 ? `${Math.min(...economy)} - ${Math.max(...economy)} km/l` : 'Electric') : '-'}
              </div>
            );
          })}
        </div>

        {/* Row Group 3: Swatches and Colors */}
        <div className="compare-row compare-row-category-title">
          <span>Design Aesthetics</span>
        </div>

        <div className="compare-row">
          <div className="compare-cell compare-cell-label">Available Colors</div>
          {columns.map((v, i) => (
            <div key={i} className="compare-cell">
              {v ? (
                v.colors && v.colors.length > 0 ? (
                  <div className="compare-swatch-list">
                    {v.colors.map(color => (
                      <div 
                        key={color.id} 
                        className="compare-swatch-dot"
                        style={{ backgroundColor: color.color_code }}
                        title={color.color_name}
                      />
                    ))}
                  </div>
                ) : 'Single Standard Color'
              ) : '-'}
            </div>
          ))}
        </div>

        {/* Row Group 4: Dynamic Features Checklist Compare */}
        <div className="compare-row compare-row-category-title">
          <span>Comfort & Convenience Features</span>
        </div>

        {uniqueFeatures.length > 0 ? (
          uniqueFeatures.map(featName => (
            <div key={featName} className="compare-row">
              <div className="compare-cell compare-cell-label">{featName}</div>
              {columns.map((v, i) => {
                if (!v) return <div key={i} className="compare-cell">-</div>;
                const status = checkFeatureStatus(v, featName);
                return (
                  <div key={i} className="compare-cell">
                    {status === 'standard' ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <Check size={16} /> Standard
                      </span>
                    ) : status === 'optional' ? (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Minus size={14} /> Optional
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>Not Available</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="compare-row">
            <div className="compare-cell compare-cell-label">Standard Features</div>
            {columns.map((v, i) => (
              <div key={i} className="compare-cell">
                {v ? 'No custom attributes entered' : '-'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
