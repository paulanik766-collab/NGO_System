import React, { useState, useEffect } from 'react';

const CollectInstallmentModal = ({
  loan,
  installment,
  officers = [],
  onCollect,
  onClose,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    amount: installment?.amount || 0,
    paymentMethod: 'Cash',
    collectedBy: '',
    lateFine: 0,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (installment) {
      setFormData({
        amount: installment.amount || 0,
        paymentMethod: 'Cash',
        collectedBy: officers.length > 0 ? officers[0]._id : '',
        lateFine: 0,
        notes: '',
      });
    }
  }, [installment, officers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrors({ amount: 'Payment amount must be greater than zero' });
      return;
    }

    onCollect({
      loanId: loan._id,
      installmentNumber: installment.installmentNumber,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      collectedBy: formData.collectedBy || undefined,
      lateFine: Number(formData.lateFine) || 0,
      notes: formData.notes,
    });
  };

  if (!loan || !installment) return null;

  const isOverdue = new Date(installment.dueDate) < new Date() && installment.status !== 'Paid';

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: isOverdue ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${isOverdue ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: isOverdue ? '#991b1b' : '#166534', fontWeight: 600 }}>
              Loan: {loan.loanId} • Member: {loan.member?.fullName} ({loan.member?.memberId})
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '2px' }}>
              Installment #{installment.installmentNumber}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Scheduled Due Date</div>
            <div style={{ fontWeight: 600, color: isOverdue ? '#dc2626' : 'var(--gray-800)' }}>
              {new Date(installment.dueDate).toLocaleDateString()}
              {isOverdue && <span style={{ color: '#dc2626', marginLeft: '4px' }}>(Overdue)</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Collection Amount (BDT) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            min="1"
            className={`form-control ${errors.amount ? 'error' : ''}`}
            value={formData.amount}
            onChange={(e) => {
              setFormData({ ...formData, amount: e.target.value });
              setErrors({});
            }}
          />
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select
            className="form-control"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="Cash">Cash Collection (Field)</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Collected By (Field Officer)</label>
          <select
            className="form-control"
            value={formData.collectedBy}
            onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
          >
            <option value="">General Field Collection</option>
            {officers.map((off) => (
              <option key={off._id} value={off._id}>
                {off.fullName} ({off.employeeId} • {off.designation})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Late Fine / Penalty (if any)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={formData.lateFine}
            onChange={(e) => setFormData({ ...formData, lateFine: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Collection Remarks / Notes</label>
        <input
          type="text"
          className="form-control"
          placeholder="Receipt remarks or field collection note..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Recording Payment...' : `Confirm Collection (৳${Number(formData.amount).toLocaleString()})`}
        </button>
      </div>
    </form>
  );
};

export default CollectInstallmentModal;
