import React from 'react';
import { Compass } from 'lucide-react';

const Recommend = () => {
  return (
    <div className="glass-panel animate-fade-in" style={styles.card}>
      <Compass size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h2>Weighted Matchmaking Assistant</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
        The interactive scoring selector (Budget matching, Safety weighting, Purpose selector) will be unlocked in Phase 6.
      </p>
    </div>
  );
};

const styles = {
  card: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    marginTop: '2rem',
  }
};

export default Recommend;
