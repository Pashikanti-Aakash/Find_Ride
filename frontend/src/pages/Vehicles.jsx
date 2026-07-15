import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Vehicles.css';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Search, Car, SlidersHorizontal, GitCompare, RefreshCw, Heart } from 'lucide-react';

const Vehicles = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial parameters from URL (if navigating from Home categories)
  const getUrlParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      type: params.get('type') || 'all',
      brandId: params.get('brandId') || '',
      search: params.get('search') || '',
      maxPrice: params.get('maxPrice') || '10000000',
      seating: params.get('seating') ? params.get('seating').split(',') : [],
      fuelTypes: params.get('fuelTypes') ? params.get('fuelTypes').split(',') : [],
      transmissions: params.get('transmissions') ? params.get('transmissions').split(',') : []
    };
  };

  const initialParams = getUrlParams();

  // Filter States
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedType, setSelectedType] = useState(initialParams.type);
  const [selectedBrand, setSelectedBrand] = useState(initialParams.brandId);
  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [maxPrice, setMaxPrice] = useState(parseInt(initialParams.maxPrice));
  const [selectedSeating, setSelectedSeating] = useState(initialParams.seating);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState(initialParams.fuelTypes);
  const [selectedTransmissions, setSelectedTransmissions] = useState(initialParams.transmissions);
  
  const { user } = useContext(AuthContext);
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  // Loading & Comparison state
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState(() => {
    const saved = localStorage.getItem('compareVehicles');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch favorites list to check which cards show filled hearts
  useEffect(() => {
    const fetchFavoriteIds = async () => {
      if (user && user.role === 'user') {
        try {
          const res = await api.get('/favorites');
          setFavoriteIds(res.data.map(fav => fav.id));
        } catch (err) {
          console.error('Error fetching favorites list:', err.message);
        }
      } else {
        setFavoriteIds([]);
      }
    };
    fetchFavoriteIds();
  }, [user]);

  const toggleFavorite = async (vehicleId, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to add vehicles to your favorites wishlist.');
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      alert('Only general users can add vehicles to their favorites.');
      return;
    }
    
    try {
      const res = await api.post(`/favorites/${vehicleId}`);
      if (res.data.favorited) {
        setFavoriteIds([...favoriteIds, vehicleId]);
      } else {
        setFavoriteIds(favoriteIds.filter(id => id !== vehicleId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err.message);
    }
  };

  // Fetch brands
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

  // Fetch approved vehicles based on filters combination
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
        
        // Add Slider budget limits
        queryParams.append('maxPrice', maxPrice);

        // Add array listings joined by comma (only if active category is 'all' or 'car')
        if (selectedSeating.length > 0 && (selectedType === 'all' || selectedType === 'car')) {
          queryParams.append('seating', selectedSeating.join(','));
        }
        if (selectedFuelTypes.length > 0) {
          queryParams.append('fuelTypes', selectedFuelTypes.join(','));
        }
        if (selectedTransmissions.length > 0) {
          queryParams.append('transmissions', selectedTransmissions.join(','));
        }

        const res = await api.get(`/vehicles?${queryParams.toString()}`);
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchFilteredVehicles();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedType, selectedBrand, searchQuery, maxPrice, selectedSeating, selectedFuelTypes, selectedTransmissions]);

  // Sync comparison selections with localstorage
  useEffect(() => {
    localStorage.setItem('compareVehicles', JSON.stringify(compareIds));
  }, [compareIds]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateUrl({ type, brandId: selectedBrand, search: searchQuery, maxPrice, seating: selectedSeating, fuelTypes: selectedFuelTypes, transmissions: selectedTransmissions });
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    updateUrl({ type: selectedType, brandId, search: searchQuery, maxPrice, seating: selectedSeating, fuelTypes: selectedFuelTypes, transmissions: selectedTransmissions });
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchQuery(search);
    updateUrl({ type: selectedType, brandId: selectedBrand, search, maxPrice, seating: selectedSeating, fuelTypes: selectedFuelTypes, transmissions: selectedTransmissions });
  };

  const handlePriceChange = (e) => {
    const val = parseInt(e.target.value);
    setMaxPrice(val);
    updateUrl({ type: selectedType, brandId: selectedBrand, search: searchQuery, maxPrice: val, seating: selectedSeating, fuelTypes: selectedFuelTypes, transmissions: selectedTransmissions });
  };

  const handleCheckboxToggle = (value, list, setList, key) => {
    let updated;
    if (list.includes(value)) {
      updated = list.filter(item => item !== value);
    } else {
      updated = [...list, value];
    }
    setList(updated);
    
    const nextParams = {
      type: selectedType,
      brandId: selectedBrand,
      search: searchQuery,
      maxPrice,
      seating: selectedSeating,
      fuelTypes: selectedFuelTypes,
      transmissions: selectedTransmissions
    };
    nextParams[key] = updated;
    updateUrl(nextParams);
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedBrand('');
    setSearchQuery('');
    setMaxPrice(10000000);
    setSelectedSeating([]);
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    navigate('/vehicles', { replace: true });
  };

  const updateUrl = (filtersObj) => {
    const params = new URLSearchParams();
    if (filtersObj.type !== 'all') params.append('type', filtersObj.type);
    if (filtersObj.brandId) params.append('brandId', filtersObj.brandId);
    if (filtersObj.search.trim()) params.append('search', filtersObj.search);
    if (filtersObj.maxPrice !== 10000000) params.append('maxPrice', filtersObj.maxPrice);
    
    // Only persist seating capacity queries if browsing car categories or all
    if (filtersObj.seating.length > 0 && (filtersObj.type === 'all' || filtersObj.type === 'car')) {
      params.append('seating', filtersObj.seating.join(','));
    }
    if (filtersObj.fuelTypes.length > 0) params.append('fuelTypes', filtersObj.fuelTypes.join(','));
    if (filtersObj.transmissions.length > 0) params.append('transmissions', filtersObj.transmissions.join(','));

    const queryStr = params.toString();
    navigate(`/vehicles${queryStr ? `?${queryStr}` : ''}`, { replace: true });
  };

  // Select/Deselect items for the comparison table (Max 3 items limit, restricted by type)
  const toggleCompare = (vehicle, e) => {
    e.stopPropagation();
    if (compareIds.includes(vehicle.id)) {
      const updated = compareIds.filter(id => id !== vehicle.id);
      setCompareIds(updated);
      if (updated.length === 0) {
        localStorage.removeItem('compareType');
      }
    } else {
      if (compareIds.length >= 3) {
        alert('You can compare a maximum of 3 vehicles side-by-side. Please remove one first.');
        return;
      }
      
      const savedType = localStorage.getItem('compareType');
      if (savedType && savedType !== vehicle.type) {
        alert(`You can only compare vehicles of the same category. Please remove the selected ${savedType}(s) before comparing ${vehicle.type}s.`);
        return;
      }
      
      if (compareIds.length === 0) {
        localStorage.setItem('compareType', vehicle.type);
      }
      
      setCompareIds([...compareIds, vehicle.id]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatPriceLakhs = (price) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    }
    return `${(price / 100000).toFixed(0)} Lakhs`;
  };

  const showSeatingFilter = selectedType === 'all' || selectedType === 'car';

  return (
    <div className="catalog-container animate-fade-in">
      <div className="catalog-header">
        <div className="catalog-header-text">
          <h1>Explore Vehicle Catalog</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse spec attributes and configure variants across top brands</p>
        </div>
        
        {/* Floating compare board navigation badge */}
        {compareIds.length > 0 && (
          <div className="compare-float-badge" onClick={() => navigate('/compare')}>
            <GitCompare size={16} />
            <span>Compare Board ({compareIds.length}/3)</span>
          </div>
        )}
      </div>

      {/* Two Column Layout Grid */}
      <div className="catalog-layout-grid">
        {/* Left Side: Filter Sidebar Panel */}
        <aside className="glass-panel catalog-filter-sidebar">
          <div className="filter-group" style={{ paddingBottom: '0.75rem' }}>
            <div className="filter-title">
              <span>Filter Options</span>
              <span className="filter-reset-link" onClick={resetFilters}>
                <RefreshCw size={12} style={{ marginRight: '2px', display: 'inline' }} /> Reset
              </span>
            </div>
          </div>

          {/* Budget Range Slider */}
          <div className="filter-group">
            <span className="filter-title">Max Budget</span>
            <div className="budget-slider-container">
              <input
                type="range"
                min="100000"
                max="10000000"
                step="50000"
                value={maxPrice}
                onChange={handlePriceChange}
                className="budget-slider-input"
              />
              <div className="budget-slider-labels">
                <span>1 Lakh</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {formatPriceLakhs(maxPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Seating capacities checklist - Hidden for bikes/scooters */}
          {showSeatingFilter && (
            <div className="filter-group">
              <span className="filter-title">Seating Capacity</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[2, 4, 5, 7].map((num) => (
                  <label key={num} className="filter-checkbox-option">
                    <input
                      type="checkbox"
                      checked={selectedSeating.includes(num.toString())}
                      onChange={() => handleCheckboxToggle(num.toString(), selectedSeating, setSelectedSeating, 'seating')}
                      className="filter-checkbox-field"
                    />
                    <span>{num} Seater</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fuel Types checkboxes */}
          <div className="filter-group">
            <span className="filter-title">Fuel Type</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['petrol', 'diesel', 'electric', 'hybrid', 'cng'].map((fuel) => (
                <label key={fuel} className="filter-checkbox-option" style={{ textTransform: 'capitalize' }}>
                  <input
                    type="checkbox"
                    checked={selectedFuelTypes.includes(fuel)}
                    onChange={() => handleCheckboxToggle(fuel, selectedFuelTypes, setSelectedFuelTypes, 'fuelTypes')}
                    className="filter-checkbox-field"
                  />
                  <span>{fuel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmissions checkboxes */}
          <div className="filter-group">
            <span className="filter-title">Transmission</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['manual', 'automatic', 'semi-automatic', 'none'].map((trans) => (
                <label key={trans} className="filter-checkbox-option" style={{ textTransform: 'capitalize' }}>
                  <input
                    type="checkbox"
                    checked={selectedTransmissions.includes(trans)}
                    onChange={() => handleCheckboxToggle(trans, selectedTransmissions, setSelectedTransmissions, 'transmissions')}
                    className="filter-checkbox-field"
                  />
                  <span>{trans === 'none' ? 'Electric / Direct Drive' : trans}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Search and Listings grid */}
        <main className="catalog-results-panel">
          <div className="glass-panel catalog-search-card">
            {/* Search text input */}
            <div className="catalog-search-input-wrapper">
              <Search className="catalog-search-icon" size={18} />
              <input
                type="text"
                className="form-input catalog-search-field"
                placeholder="Search by vehicle name, body style..."
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

          {/* Grid of Results */}
          {loading ? (
            <div className="catalog-grid">
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
                  {/* Compare toggle badge */}
                  <div 
                    className={`catalog-card-compare-chk ${compareIds.includes(vehicle.id) ? 'active' : ''}`}
                    onClick={(e) => toggleCompare(vehicle, e)}
                  >
                    <input
                      type="checkbox"
                      checked={compareIds.includes(vehicle.id)}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Compare</span>
                  </div>

                  {/* Favorite wishlist heart toggle */}
                  {user && user.role === 'user' && (
                    <button
                      type="button"
                      className={`catalog-card-favorite-btn ${favoriteIds.includes(vehicle.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(vehicle.id, e)}
                      title={favoriteIds.includes(vehicle.id) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart size={16} fill={favoriteIds.includes(vehicle.id) ? "var(--error)" : "none"} />
                    </button>
                  )}

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
              <p>Try refining your search text or resetting the slider / category filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Vehicles;
