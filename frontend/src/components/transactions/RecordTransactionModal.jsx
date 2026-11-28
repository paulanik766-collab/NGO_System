import React, { useState, useEffect } from 'react';
import { transactionAPI, memberAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RecordTransactionModal = ({ isOpen, onClose, onTransactionCreated }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'fee_payment',
    category: 'credit',
    amount: '',
    paymentMethod: 'Cash',
    referenceId: '',
    referenceModel: 'Manual',
    performedBy: user?.name || 'Staff',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      memberAPI.getAll({ limit: 100 })
        .then((res) => {
          if (res.data?.success && res.data.members) {
            setMembers(res.data.members);
            if (res.data.members.length > 0 && !formData.memberId) {
              setFormData((prev) => ({ ...prev, memberId: res.data.members[0]._id }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    let autoCat = 'credit';
    if (['loan_disbursement', 'savings_withdrawal'].includes(selectedType)) {
      autoCat = 'debit';
    }
    setFormData({
      ...formData,
      type: selectedType,
      category: autoCat,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount || Number(formData.amount) <= 0) {
      setErrorMsg('Please select a member and enter a valid positive amount');
      return;
    }

    setLoading(true);
    try {
      const res = await transactionAPI.create({
        ...formData,
        amount: Number(formData.amount),
        performedBy: user?.name || formData.performedBy || 'Staff',
      });

      if (res.data?.success) {
        onTransactionCreated();
        onClose();
      } else {
        setErrorMsg(res.data?.message || 'Failed to record transaction');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error recording transaction');
    } finally {
      setLoading(false);
    }
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
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Record Financial Transaction
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              Member 3 Unified Central Ledger
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Select Member *</label>
            <select
              name="memberId"
              className="form-control"
              value={formData.memberId}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName || m.name} ({m.memberId || m.accountNumber}) - {m.phone}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Transaction Type *</label>
              <select
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleTypeChange}
              >
                <option value="installment_payment">Installment Payment</option>
                <option value="loan_disbursement">Loan Disbursement</option>
                <option value="savings_deposit">Savings Deposit</option>
                <option value="savings_withdrawal">Savings Withdrawal</option>
                <option value="fee_payment">Fee / Service Charge</option>
                <option value="adjustment">Manual Adjustment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ledger Movement</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="credit">Credit / Inflow (+)</option>
                <option value="debit">Debit / Outflow (-)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount (৳) *</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                placeholder="e.g. 5000"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Payment Method</label>
              <select
                name="paymentMethod"
                className="form-control"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Reference / Voucher ID</label>
            <input
              type="text"
              name="referenceId"
              className="form-control"
              placeholder="e.g. VCH-2026-001 or Cheque #"
              value={formData.referenceId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Remarks / Purpose</label>
            <textarea
              name="remarks"
              className="form-control"
              rows="2"
              placeholder="Brief description of this financial transaction"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Commit to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordTransactionModal;
