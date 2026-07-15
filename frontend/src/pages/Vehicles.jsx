import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Vehicles.css';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Search, Car, SlidersHorizontal } from 'lucide-react';

const Vehicles = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial parameters from URL (if navigating from Home categories)
  const getUrlParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      type: params.get('type') || 'all',
      brandId: params.get('brandId') || '',
      search: params.get('search') || ''
    };
  };

  const initialParams = getUrlParams();

  // States
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedType, setSelectedType] = useState(initialParams.type);
  const [selectedBrand, setSelectedBrand] = useState(initialParams.brandId);
  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [loading, setLoading] = useState(true);

  // Parse URL changes (if query parameters change via navbar/footer redirect clicks)
  useEffect(() => {
    const params = getUrlParams();
    setSelectedType(params.type);
    setSelectedBrand(params.brandId);
    setSearchQuery(params.search);
  }, [location.search]);

  // Fetch all brands for filter select list
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brands');
        setBrands(res.data);
      } catch (err) {
        console.error('Error fetching brands list:', err.message);
      }
    };
    fetchBrands();
  }, []);

  // Fetch approved vehicles based on active filter combination
  useEffect(() => {
    const fetchFilteredVehicles = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (selectedType !== 'all') {
          queryParams.append('type', selectedType);
        }
        if (selectedBrand) {
          queryParams.append('brandId', selectedBrand);
        }
        if (searchQuery.trim()) {
          queryParams.append('search', searchQuery);
        }

        const res = await api.get(`/vehicles?${queryParams.toString()}`);
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    // Apply debounce limit if search query changes
    const delayDebounce = setTimeout(() => {
      fetchFilteredVehicles();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedType, selectedBrand, searchQuery]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateUrl({ type, brandId: selectedBrand, search: searchQuery });
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    updateUrl({ type: selectedType, brandId, search: searchQuery });
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchQuery(search);
    updateUrl({ type: selectedType, brandId: selectedBrand, search });
  };

  const updateUrl = ({ type, brandId, search }) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.append('type', type);
    if (brandId) params.append('brandId', brandId);
    if (search.trim()) params.append('search', search);

    const queryStr = params.toString();
    navigate(`/vehicles${queryStr ? `?${queryStr}` : ''}`, { replace: true });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="catalog-container animate-fade-in">
      <div className="catalog-header">
        <h1>Explore Vehicle Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse spec attributes and configure variants across top brands</p>
      </div>

      {/* Filter Options Panel */}
      <div className="glass-panel catalog-filter-card">
        <div className="catalog-search-row">
          {/* Search text input */}
          <div className="catalog-search-input-wrapper">
            <Search className="catalog-search-icon" size={18} />
            <input
              type="text"
              className="form-input catalog-search-field"
              placeholder="Search by vehicle name, body type, or brand..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Brand select filter */}
          <div className="form-group catalog-brand-select" style={{ marginBottom: 0 }}>
            <select
              id="brand-filter"
              className="form-input"
              value={selectedBrand}
              onChange={handleBrandChange}
              style={{ height: '45px' }}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Tab Selector Bar */}
        <div className="catalog-tabs-bar">
          {['all', 'car', 'bike', 'scooter'].map((type) => (
            <button
              key={type}
              type="button"
              className={`catalog-tab-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {type === 'all' ? 'All Vehicles' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="catalog-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : vehicles.length > 0 ? (
        <div className="catalog-grid">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-panel catalog-card animate-slide-in"
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              <div className="catalog-image-wrapper">
                {vehicle.primary_image ? (
                  <img
                    src={vehicle.primary_image}
                    alt={vehicle.name}
                    className="catalog-img"
                  />
                ) : (
                  <div className="brand-logo-placeholder">
                    <Car size={24} />
                  </div>
                )}
              </div>
              <div className="catalog-card-content">
                <div className="catalog-card-meta">
                  <span className="catalog-brand-badge">{vehicle.brand_name}</span>
                  <span className="catalog-type-badge">{vehicle.type}</span>
                </div>
                <h3 className="catalog-card-title">{vehicle.name}</h3>
                <p className="catalog-card-text">
                  {vehicle.description || `Browse spec variants for the ${vehicle.brand_name} ${vehicle.name}.`}
                </p>
                <div className="catalog-card-footer">
                  <div className="catalog-card-price">
                    {vehicle.min_price ? (
                      vehicle.min_price === vehicle.max_price ? (
                        formatPrice(vehicle.min_price)
                      ) : (
                        `${formatPrice(vehicle.min_price)}`
                      )
                    ) : (
                      'TBA'
                    )}
                  </div>
                  <span className="catalog-card-btn">View Specs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel catalog-empty-card">
          <SlidersHorizontal size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Vehicles Match</h3>
          <p>Try refining your search text or choosing a different brand / category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
