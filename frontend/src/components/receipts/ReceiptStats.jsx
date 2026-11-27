import React from 'react';

const ReceiptStats = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">🧾</div>
        <div className="stat-value" style={{ color: '#2563eb' }}>
          {stats?.totalReceipts || 0}
        </div>
        <div className="stat-label">Total Receipts Issued</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-value" style={{ color: '#16a34a' }}>
          ৳{(stats?.totalAmount || 0).toLocaleString()}
        </div>
        <div className="stat-label">Total Amount Collected</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💵</div>
        <div className="stat-value" style={{ color: '#0891b2' }}>
          ৳{(stats?.cashTotal || 0).toLocaleString()}
        </div>
        <div className="stat-label">Cash Collections</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📱</div>
        <div className="stat-value" style={{ color: '#7c3aed' }}>
          ৳{(stats?.digitalTotal || 0).toLocaleString()}
        </div>
        <div className="stat-label">Digital / MFS Collections</div>
      </div>
    </div>
  );
};

export default ReceiptStats;
