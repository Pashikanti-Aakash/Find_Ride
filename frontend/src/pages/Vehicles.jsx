import React from 'react';
import { Search } from 'lucide-react';
import './Vehicles.css';

const Vehicles = () => {
  return (
    <div className="glass-panel vehicles-card animate-fade-in">
      <Search size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h2>Browse Vehicles Catalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
        Our interactive vehicle database containing detail specs, color swatches, and multi-variant pricing is coming in Phase 3.
      </p>
    </div>
  );
};

export default Vehicles;
