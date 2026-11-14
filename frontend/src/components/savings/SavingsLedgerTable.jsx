import React from 'react';

const SavingsLedgerTable = ({ entries }) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Txn ID</th>
            <th>Member</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Running Balance</th>
            <th>Method</th>
            <th>Collected By</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((item) => (
            <tr key={item._id}>
              <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {formatDate(item.date || item.createdAt)}
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                  {item.transactionId}
                </span>
              </td>
              <td>
                <strong>{item.member?.fullName || '—'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {item.member?.memberId || '—'}
                </div>
              </td>
              <td>
                <span
                  className={`badge ${
                    item.type === 'Deposit' ? 'badge-active' : 'badge-removed'
                  }`}
                  style={{
                    backgroundColor: item.type === 'Deposit' ? '#dcfce7' : '#fee2e2',
                    color: item.type === 'Deposit' ? '#166534' : '#991b1b',
                  }}
                >
                  {item.type === 'Deposit' ? '↓ Deposit' : '↑ Withdrawal'}
                </span>
              </td>
              <td>
                <span
                  className="badge"
                  style={{
                    backgroundColor: item.savingsType === 'Mandatory' ? '#dbeafe' : '#f3e8ff',
                    color: item.savingsType === 'Mandatory' ? '#1e40af' : '#6b21a8',
                  }}
                >
                  {item.savingsType}
                </span>
              </td>
              <td style={{ fontWeight: 600, color: item.type === 'Deposit' ? '#16a34a' : '#dc2626' }}>
                {item.type === 'Deposit' ? '+' : '-'}৳{item.amount.toLocaleString()}
              </td>
              <td>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  ৳{item.balanceAfter.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Prev: ৳{item.balanceBefore.toLocaleString()}
                </div>
              </td>
              <td>
                <span style={{ fontSize: '0.85rem' }}>{item.paymentMethod || 'Cash'}</span>
              </td>
              <td style={{ fontSize: '0.85rem' }}>{item.collectedBy || '—'}</td>
              <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '200px' }}>
                {item.remarks || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavingsLedgerTable;
