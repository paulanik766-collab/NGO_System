import React from 'react';

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.category === 'credit';

  const formatCurrency = (amt) => {
    return `৳${Number(amt || 0).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div className="modal-content" style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Central Financial Ledger Voucher
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0', color: '#0f172a' }}>
              {transaction.transactionId}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <div style={{
          background: isCredit ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${isCredit ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '0.8125rem', color: isCredit ? '#166534' : '#991b1b', fontWeight: 600 }}>
            {isCredit ? 'INFLOW / CREDIT (+)' : 'OUTFLOW / DEBIT (-)'}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: isCredit ? '#15803d' : '#b91c1c', margin: '4px 0' }}>
            {formatCurrency(transaction.amount)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Status: <span style={{ fontWeight: 600, color: '#0f172a' }}>{transaction.status}</span> • Method: <span style={{ fontWeight: 600, color: '#0f172a' }}>{transaction.paymentMethod}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transaction Type</div>
            <div style={{ fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
              {transaction.type?.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transaction Date</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(transaction.transactionDate)}</div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Associated Member</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {transaction.member?.fullName || transaction.member?.name || 'N/A'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ID: {transaction.member?.memberId || transaction.member?.accountNumber || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reference Document</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {transaction.referenceId || 'N/A'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Model: {transaction.referenceModel || 'Direct'}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Performed By Staff</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{transaction.performedBy || 'System'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Notes / Remarks</div>
            <div style={{ fontWeight: 500, color: '#334155' }}>{transaction.remarks || 'No notes provided'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            🖨️ Print Voucher
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
