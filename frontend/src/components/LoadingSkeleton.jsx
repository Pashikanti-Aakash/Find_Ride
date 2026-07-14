import React from 'react';
import './LoadingSkeleton.css';

export const CardSkeleton = () => {
  return (
    <div className="glass-panel skeleton-card">
      <div className="skeleton skeleton-card-media"></div>
      <div className="skeleton skeleton-card-title"></div>
      <div className="skeleton skeleton-card-text"></div>
      <div className="skeleton-card-footer">
        <div className="skeleton skeleton-card-price"></div>
        <div className="skeleton skeleton-card-btn"></div>
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="skeleton-detail-wrapper">
      <div className="skeleton-detail-row">
        <div className="skeleton skeleton-detail-image"></div>
        <div className="skeleton-detail-info">
          <div className="skeleton skeleton-detail-title"></div>
          <div className="skeleton skeleton-detail-subtitle"></div>
          <div className="skeleton skeleton-detail-price"></div>
          <div className="skeleton skeleton-detail-text"></div>
          <div className="skeleton-detail-actions">
            <div className="skeleton skeleton-detail-btn"></div>
            <div className="skeleton skeleton-detail-btn"></div>
          </div>
        </div>
      </div>
      <div className="skeleton skeleton-detail-specs"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="glass-panel skeleton-table-wrapper">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton skeleton-table-header-col"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton skeleton-table-row-col"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default { CardSkeleton, DetailSkeleton, TableSkeleton };
