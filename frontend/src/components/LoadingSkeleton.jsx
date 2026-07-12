import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-lg)' }}></div>
      <div className="skeleton" style={{ width: '60%', height: '1.25rem' }}></div>
      <div className="skeleton" style={{ width: '80%', height: '1rem' }}></div>
      <div style={{ display: 'flex', justifyContent: 'between', marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ width: '40%', height: '1.5rem' }}></div>
        <div className="skeleton" style={{ width: '30%', height: '1.5rem' }}></div>
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="skeleton" style={{ flex: '1', minWidth: '300px', height: '350px', borderRadius: 'var(--radius-xl)' }}></div>
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ width: '40%', height: '2rem' }}></div>
          <div className="skeleton" style={{ width: '80%', height: '1.25rem' }}></div>
          <div className="skeleton" style={{ width: '50%', height: '1.75rem' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '80px' }}></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
            <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
          </div>
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '150px' }}></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="glass-panel" style={{ padding: '1rem', width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: '1.5rem' }}></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{ flex: 1, height: '1.25rem' }}></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default { CardSkeleton, DetailSkeleton, TableSkeleton };
