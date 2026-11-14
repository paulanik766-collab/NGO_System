import React from 'react';

const SavingsAccountTable = ({ accounts, onTransact, onViewPassbook, onToggleStatus }) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Account No.</th>
            <th>Member</th>
            <th>Account Type</th>
            <th>Current Balance</th>
            <th>Mandatory Target</th>
            <th>Status</th>
            <th>Opened Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc._id}>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                  {acc.accountNumber}
                </span>
              </td>
              <td>
                <strong>{acc.member?.fullName || '—'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {acc.member?.memberId || '—'} • {acc.member?.phone || ''}
                </div>
              </td>
              <td>{acc.accountType}</td>
              <td>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: acc.balance > 0 ? '#16a34a' : '#64748b',
                  }}
                >
                  ৳{acc.balance.toLocaleString()}
                </span>
              </td>
              <td>৳{acc.mandatoryAmount ? acc.mandatoryAmount.toLocaleString() : '200'}</td>
              <td>
                <span
                  className={`badge ${
                    acc.status === 'Active'
                      ? 'badge-active'
                      : acc.status === 'Dormant'
                      ? 'badge-warning'
                      : 'badge-inactive'
                  }`}
                >
                  {acc.status}
                </span>
              </td>
              <td style={{ fontSize: '0.85rem' }}>{formatDate(acc.openedDate || acc.createdAt)}</td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onTransact(acc)}
                    disabled={acc.status !== 'Active'}
                    title="Log Deposit or Withdrawal"
                  >
                    ± Transact
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewPassbook(acc)}
                    title="View Member Passbook Statement"
                  >
                    📖 Passbook
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavingsAccountTable;
