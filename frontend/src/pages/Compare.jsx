import React from 'react';
import { GitCompare } from 'lucide-react';
import './Compare.css';

const Compare = () => {
  return (
    <div className="glass-panel compare-card animate-fade-in">
      <GitCompare size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h2>Compare Vehicles</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
        The side-by-side spec comparison table for multi-attribute contrast matches is coming in Phase 5.
      </p>
    </div>
  );
};

export default Compare;
