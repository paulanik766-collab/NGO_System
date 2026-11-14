import React from 'react';

const SavingsStats = ({ stats }) => {
  const formatCurrency = (val) => `৳ ${(val || 0).toLocaleString()}`;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-value" style={{ color: '#16a34a' }}>
          {formatCurrency(stats?.totalBalance)}
        </div>
        <div className="stat-label">Total Savings Balance</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📥</div>
        <div className="stat-value" style={{ color: '#2563eb' }}>
          {formatCurrency(stats?.mandatoryTotal)}
        </div>
        <div className="stat-label">Mandatory Deposits</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✨</div>
        <div className="stat-value" style={{ color: '#7c3aed' }}>
          {formatCurrency(stats?.voluntaryTotal)}
        </div>
        <div className="stat-label">Voluntary Deposits</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📤</div>
        <div className="stat-value" style={{ color: '#dc2626' }}>
          {formatCurrency(stats?.totalWithdrawalsAmount)}
        </div>
        <div className="stat-label">Total Withdrawals</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-value" style={{ color: '#0891b2' }}>
          {stats?.activeAccounts || 0}
        </div>
        <div className="stat-label">Active Savings Accounts</div>
      </div>
    </div>
  );
};

export default SavingsStats;
