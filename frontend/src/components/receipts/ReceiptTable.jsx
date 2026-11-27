import React from 'react';

const ReceiptTable = ({ receipts, onView, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
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
            <th>Receipt No</th>
            <th>Member</th>
            <th>Collection Type</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Date</th>
            <th>Collected By</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r) => (
            <tr key={r._id}>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                  {r.receiptNumber}
                </span>
              </td>
              <td>
                <strong>{r.member?.fullName || '—'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {r.member?.memberId || '—'}
                </div>
              </td>
              <td>
                <span
                  className="badge"
                  style={{
                    backgroundColor:
                      r.collectionType === 'Savings Deposit'
                        ? '#dbeafe'
                        : r.collectionType === 'Loan Installment'
                        ? '#fef3c7'
                        : '#f1f5f9',
                    color:
                      r.collectionType === 'Savings Deposit'
                        ? '#1e40af'
                        : r.collectionType === 'Loan Installment'
                        ? '#92400e'
                        : '#334155',
                  }}
                >
                  {r.collectionType}
                </span>
              </td>
              <td>
                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>
                  ৳{Number(r.amount).toLocaleString()}
                </span>
              </td>
              <td>{r.paymentMethod}</td>
              <td style={{ fontSize: '0.85rem' }}>{formatDate(r.collectionDate || r.createdAt)}</td>
              <td style={{ fontSize: '0.85rem' }}>{r.collectedBy || '—'}</td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onView(r)}
                    title="View & Print Digital Receipt"
                  >
                    🖨️ View / Print
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(r._id)}
                    title="Delete Receipt"
                  >
                    ✕
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

export default ReceiptTable;
