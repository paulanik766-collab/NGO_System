import React from 'react';

const LoanScheduleViewerModal = ({ scheduleData, onOpenCollect, onClose }) => {
  if (!scheduleData) return null;

  const { loan, installments = [], paymentRecords = [], stats = {} } = scheduleData;

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              Loan: {loan.loanId} — {loan.member?.fullName} ({loan.member?.memberId})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: '4px 0 0 0' }}>
              Purpose: {loan.purpose} • Phone: {loan.member?.phone}
            </p>
          </div>
          <div>
            <span
              className={`badge ${
                loan.status === 'Disbursed'
                  ? 'badge-active'
                  : loan.status === 'Closed'
                  ? 'badge-primary'
                  : 'badge-inactive'
              }`}
              style={{ fontSize: '0.85rem', padding: '4px 12px' }}
            >
              {loan.status}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span>Repayment Progress</span>
            <strong>{stats.progressPercent || 0}% ({stats.paidInstallments} of {stats.totalInstallments} paid)</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stats.progressPercent || 0}%`,
                height: '100%',
                background: stats.progressPercent === 100 ? '#16a34a' : '#2563eb',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Financial metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Principal</div>
            <div style={{ fontWeight: 600 }}>৳{loan.principalAmount?.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Interest</div>
            <div style={{ fontWeight: 600, color: '#0891b2' }}>৳{loan.totalInterest?.toLocaleString()} ({loan.interestRate}%)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Payable</div>
            <div style={{ fontWeight: 700, color: '#2563eb' }}>৳{loan.totalPayable?.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Collected</div>
            <div style={{ fontWeight: 700, color: '#16a34a' }}>৳{(loan.totalPaid || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Remaining Balance</div>
            <div style={{ fontWeight: 700, color: '#dc2626' }}>৳{(stats.remainingBalance || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
        Scheduled Installments ({installments.length})
      </h4>
      <div className="table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date</th>
              <th>Scheduled Amount</th>
              <th>Paid Amount</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => {
              const isOverdue = new Date(inst.dueDate) < new Date() && inst.status !== 'Paid';
              return (
                <tr key={inst._id || inst.installmentNumber}>
                  <td>
                    <strong>#{inst.installmentNumber}</strong>
                  </td>
                  <td>
                    {new Date(inst.dueDate).toLocaleDateString()}
                    {isOverdue && <span style={{ color: '#dc2626', fontSize: '0.75rem', marginLeft: '6px' }}>(Overdue)</span>}
                  </td>
                  <td>৳{inst.amount.toLocaleString()}</td>
                  <td>{inst.paidAmount ? `৳${inst.paidAmount.toLocaleString()}` : '—'}</td>
                  <td>{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString() : '—'}</td>
                  <td>
                    {inst.status === 'Paid' ? (
                      <span className="badge badge-active">Paid</span>
                    ) : isOverdue ? (
                      <span className="badge badge-danger">Overdue</span>
                    ) : (
                      <span className="badge badge-inactive">Unpaid</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {inst.status !== 'Paid' && loan.status === 'Disbursed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenCollect(loan, inst)}
                      >
                        💳 Collect Payment
                      </button>
                    )}
                    {inst.status === 'Paid' && (
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>✓ Settled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Collection Transaction History */}
      {paymentRecords.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
            Payment Receipts / Transaction History ({paymentRecords.length})
          </h4>
          <div className="table-wrapper" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Installment</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Collector</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                        {p.receiptNumber}
                      </span>
                    </td>
                    <td>#{p.installmentNumber}</td>
                    <td style={{ fontWeight: 600, color: '#16a34a' }}>৳{p.amount.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-primary">{p.paymentMethod}</span>
                    </td>
                    <td>{p.collectorName || 'Field Officer'}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, marginTop: '16px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LoanScheduleViewerModal;
