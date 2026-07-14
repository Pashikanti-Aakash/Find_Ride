import React from 'react';
import { Compass } from 'lucide-react';
import './Recommend.css';

const Recommend = () => {
  return (
    <div className="glass-panel recommend-card animate-fade-in">
      <Compass size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h2>Weighted Matchmaking Assistant</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
        The interactive scoring selector (Budget matching, Safety weighting, Purpose selector) will be unlocked in Phase 6.
      </p>
    </div>
  );
};

export default Recommend;
