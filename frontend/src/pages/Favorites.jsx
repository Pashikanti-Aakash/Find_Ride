import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Favorites.css';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Heart, Car, ArrowRight } from 'lucide-react';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await api.get('/favorites');
        setFavorites(res.data);
      } catch (err) {
        console.error('Error fetching favorites:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  const handleUnfavorite = async (vehicleId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/favorites/${vehicleId}`);
      // Filter out of current state array
      setFavorites(favorites.filter(fav => fav.id !== vehicleId));
    } catch (err) {
      console.error('Error removing favorite:', err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>My Wishlist</h1>
        </div>
        <div className="favorites-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container animate-fade-in">
      <div className="favorites-header">
        <h1>My Wishlist</h1>
        <p style={{ color: 'var(--text-muted)' }}>Automobiles you have saved for tracking spec updates</p>
      </div>

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-panel favorites-card animate-slide-in"
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              {/* Unfavorite Heart overlay */}
              <button
                type="button"
                className="favorites-heart-btn"
                onClick={(e) => handleUnfavorite(vehicle.id, e)}
                title="Remove from favorites"
              >
                <Heart size={16} fill="var(--error)" />
              </button>

              <div className="favorites-image-wrapper">
                {vehicle.primary_image ? (
                  <img
                    src={vehicle.primary_image}
                    alt={vehicle.name}
                    className="favorites-img"
                  />
                ) : (
                  <div className="brand-logo-placeholder">
                    <Car size={24} />
                  </div>
                )}
              </div>
              
              <div className="favorites-card-content">
                <div className="favorites-card-meta">
                  <span className="favorites-brand-badge">{vehicle.brand_name}</span>
                  <span className="favorites-type-badge">{vehicle.type}</span>
                </div>
                <h3 className="favorites-card-title">{vehicle.name}</h3>
                <p className="favorites-card-text">
                  {vehicle.description || `Browse spec variants for the ${vehicle.brand_name} ${vehicle.name}.`}
                </p>
                <div className="favorites-card-footer">
                  <div className="favorites-card-price">
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
                  <span className="favorites-card-btn">View Specs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel favorites-empty-card">
          <Heart size={48} color="var(--error)" style={{ marginBottom: '0.5rem' }} />
          <h3>No Saved Vehicles</h3>
          <p>
            Your favorites list is currently empty. Bookmark automobiles in the browse catalog to display them here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/vehicles')}>
            Browse Vehicles Catalog <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
