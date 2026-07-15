import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  Compass, 
  GitCompare, 
  Search, 
  Award, 
  ShieldCheck, 
  Gauge, 
  Fuel, 
  DollarSign, 
  TrendingUp,
  Car
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved vehicles to show under featured
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vehicles');
        // Take the top 3 approved listings
        setFeaturedVehicles(res.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCategoryClick = (type) => {
    navigate(`/vehicles?type=${type}`);
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Header Section */}
      <header className="home-hero glass-panel">
        <div className="home-hero-content">
          <div className="home-badge-banner">
            <span className="home-badge-text">INTUITION DRIVEN CHOICE</span>
          </div>
          <h1 className="home-hero-title">
            Find the Perfect Vehicle <br />
            Matched to <span className="gradient-text">Your Lifestyle</span>
          </h1>
          <p className="home-hero-sub">
            No complex AI black boxes. Find Ride uses a transparent, weighted multi-attribute algorithm to align specifications directly to your preferences.
          </p>
          <div className="home-hero-cta">
            <Link to="/recommend" className="btn btn-primary home-hero-btn">
              <Compass size={18} /> Get Recommendation
            </Link>
            <Link to="/vehicles" className="btn btn-secondary home-hero-btn">
              <Search size={18} /> Browse Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Category Redirection Grid */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-sec-title">Browse by Category</h2>
          <p className="home-sec-sub">Select a vehicle type to explore available specifications</p>
        </div>

        <div className="categories-grid">
          <div className="glass-panel card-hover category-card" onClick={() => handleCategoryClick('car')}>
            <div className="category-card-icon">
              <Car size={32} />
            </div>
            <h3 className="category-card-title">Cars</h3>
            <p className="category-card-text">Sedans, SUVs, and Hatchbacks</p>
          </div>

          <div className="glass-panel card-hover category-card" onClick={() => handleCategoryClick('bike')}>
            <div className="category-card-icon">
              <Gauge size={32} />
            </div>
            <h3 className="category-card-title">Bikes</h3>
            <p className="category-card-text">Cruisers, Sports, and Commuters</p>
          </div>

          <div className="glass-panel card-hover category-card" onClick={() => handleCategoryClick('scooter')}>
            <div className="category-card-icon">
              <Fuel size={32} />
            </div>
            <h3 className="category-card-title">Scooters</h3>
            <p className="category-card-text">Electric and Petrol Scooters</p>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-sec-title">Featured Inventory</h2>
          <p className="home-sec-sub">Recent manufacturer vehicle uploads verified by our administration</p>
        </div>

        {loading ? (
          <div className="featured-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredVehicles.length > 0 ? (
          <div className="featured-grid">
            {featuredVehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className="glass-panel card-hover featured-card"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <div className="featured-image-wrapper">
                  {vehicle.primary_image ? (
                    <img 
                      src={vehicle.primary_image} 
                      alt={vehicle.name} 
                      className="featured-img"
                    />
                  ) : (
                    <div className="brand-logo-placeholder">
                      <Car size={24} />
                    </div>
                  )}
                </div>
                <div className="featured-card-content">
                  <div className="featured-card-meta">
                    <span className="featured-brand-badge">{vehicle.brand_name}</span>
                    <span className="featured-type-badge">{vehicle.type}</span>
                  </div>
                  <h3 className="featured-card-title">{vehicle.name}</h3>
                  <div className="featured-card-price">
                    {vehicle.min_price ? (
                      vehicle.min_price === vehicle.max_price ? (
                        formatPrice(vehicle.min_price)
                      ) : (
                        `${formatPrice(vehicle.min_price)} - ${formatPrice(vehicle.max_price)}`
                      )
                    ) : (
                      'Pricing Unavailable'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel featured-empty-card">
            <Car size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Vehicles Available</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Approved catalog listings will populate here once brand partners upload them.
            </p>
          </div>
        )}

        {featuredVehicles.length > 0 && (
          <div className="featured-cta-footer">
            <Link to="/vehicles" className="btn btn-secondary">
              View Complete Catalog
            </Link>
          </div>
        )}
      </section>

      {/* Capabilities Section */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-sec-title">Core Capabilities</h2>
          <p className="home-sec-sub">Explore what you can accomplish on our vehicle matchmaking engine</p>
        </div>

        <div className="home-grid">
          <div className="glass-panel card-hover home-feature-card">
            <div className="home-icon-wrapper" style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
              <Compass size={24} color="var(--primary)" />
            </div>
            <h3 className="home-card-title">Smart recommendation</h3>
            <p className="home-card-text">
              Input your budget, preferred driving purpose, fuel preference, and safety needs to receive scored matches immediately.
            </p>
            <Link to="/recommend" className="home-card-link">Try Recommendation →</Link>
          </div>

          <div className="glass-panel card-hover home-feature-card">
            <div className="home-icon-wrapper" style={{ backgroundColor: 'rgba(6,182,212,0.1)' }}>
              <GitCompare size={24} color="var(--accent)" />
            </div>
            <h3 className="home-card-title">Side-by-Side Comparison</h3>
            <p className="home-card-text">
              Align up to three vehicle models side-by-side to review discrepancies in horsepower, engine size, price, mileage, and features.
            </p>
            <Link to="/compare" className="home-card-link">Open Comparison Board →</Link>
          </div>

          <div className="glass-panel card-hover home-feature-card">
            <div className="home-icon-wrapper" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
              <Search size={24} color="var(--success)" />
            </div>
            <h3 className="home-card-title">Advanced Filters</h3>
            <p className="home-card-text">
              Sift the vehicle database using strict criteria parameters including transmission types, body styling, seating size, and brand preferences.
            </p>
            <Link to="/vehicles" className="home-card-link">View Catalog →</Link>
          </div>
        </div>
      </section>

      {/* Algorithm Explainer Section */}
      <section className="home-section home-algorithm-sec glass-panel">
        <div className="home-section-header">
          <h2 className="home-sec-title">Our Matchmaking Architecture</h2>
          <p className="home-sec-sub">How the non-AI weighted scoring utility identifies matches for you</p>
        </div>

        <div className="home-algo-content">
          <div className="home-algo-left">
            <div className="home-algo-step">
              <div className="home-algo-num">1</div>
              <div>
                <h4 className="home-algo-step-title">Define Input Attributes</h4>
                <p className="home-algo-step-text">We gather your requirements regarding target pricing, usage goals, and safety focus priorities.</p>
              </div>
            </div>
            <div className="home-algo-step">
              <div className="home-algo-num">2</div>
              <div>
                <h4 className="home-algo-step-title">Distribute Feature Weights</h4>
                <p className="home-algo-step-text">Different weights are assigned based on factors like safety, fuel economy, and torque to align with your profile preferences.</p>
              </div>
            </div>
            <div className="home-algo-step">
              <div className="home-algo-num">3</div>
              <div>
                <h4 className="home-algo-step-title">Calculate Spec Scores</h4>
                <p className="home-algo-step-text">Vehicles are cataloged and graded, and high-scoring vehicles appear first in your results list.</p>
              </div>
            </div>
          </div>

          <div className="home-algo-right">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Matching Attributes</h3>
            <div className="home-attribute-grid">
              <div className="home-attr-item">
                <DollarSign size={16} color="var(--primary)" /> Budget Target
              </div>
              <div className="home-attr-item">
                <ShieldCheck size={16} color="var(--primary)" /> Safety Priority
              </div>
              <div className="home-attr-item">
                <Gauge size={16} color="var(--primary)" /> Power / Torque
              </div>
              <div className="home-attr-item">
                <Fuel size={16} color="var(--primary)" /> Fuel Type Economy
              </div>
              <div className="home-attr-item">
                <TrendingUp size={16} color="var(--primary)" /> Seating & Cargo
              </div>
              <div className="home-attr-item">
                <Award size={16} color="var(--primary)" /> Brand Value
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
