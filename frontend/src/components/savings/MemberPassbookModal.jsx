import React, { useState, useEffect } from 'react';
import { savingsAPI } from '../../services/api';
import { LoadingSpinner } from '../common/UIComponents';

const MemberPassbookModal = ({ account, onClose }) => {
  const [statement, setStatement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatement = async () => {
      if (!account?._id) return;
      setIsLoading(true);
      try {
        const res = await savingsAPI.getLedger({ accountId: account._id, limit: 100 });
        setStatement(res.data.data || []);
      } catch (err) {
        console.error('Failed to load passbook', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatement();
  }, [account]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
            Savings Passbook Statement
          </span>
          <h2 style={{ margin: '4px 0', fontSize: '1.25rem', color: '#fff' }}>
            {account?.member?.fullName}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            ID: {account?.member?.memberId} • Phone: {account?.member?.phone}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Acc: <strong>{account?.accountNumber}</strong> ({account?.accountType})
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Current Real-time Balance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80' }}>
            ৳{account?.balance?.toLocaleString()}
          </div>
          <span className="badge badge-active" style={{ marginTop: '4px' }}>
            {account?.status}
          </span>
        </div>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {isLoading ? (
          <LoadingSpinner message="Loading statement records..." />
        ) : !statement || statement.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No transactions found for this account yet.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Txn ID</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Running Balance</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {statement.map((tx) => (
                <tr key={tx._id}>
                  <td>{formatDate(tx.date || tx.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace' }}>{tx.transactionId}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: tx.type === 'Deposit' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.savingsType}</td>
                  <td style={{ fontWeight: 600 }}>
                    {tx.type === 'Deposit' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    ৳{tx.balanceAfter.toLocaleString()}
                  </td>
                  <td style={{ color: '#64748b' }}>{tx.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default MemberPassbookModal;
