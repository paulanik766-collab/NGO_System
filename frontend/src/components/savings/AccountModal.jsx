import React, { useState, useEffect } from 'react';
import { memberAPI } from '../../services/api';

const AccountModal = ({ onSubmit, onCancel, isLoading }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('General Savings');
  const [mandatoryAmount, setMandatoryAmount] = useState('200');
  const [initialDeposit, setInitialDeposit] = useState('0');
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.getAll({ status: 'Active', limit: 100 });
        setMembers(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedMember(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load members for account opening', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    onSubmit({
      member: selectedMember,
      accountNumber: accountNumber.trim() || undefined,
      accountType,
      mandatoryAmount: parseFloat(mandatoryAmount) || 200,
      initialDeposit: parseFloat(initialDeposit) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Member *</label>
        {loadingMembers ? (
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading active members...</div>
        ) : (
          <select
            className="form-control"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName} ({m.memberId}) — {m.phone}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Account Number (Optional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Auto-generated if blank"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Account Type *</label>
          <select
            className="form-control"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            required
          >
            <option value="General Savings">General Savings</option>
            <option value="Mandatory DPS">Mandatory DPS</option>
            <option value="Voluntary Savings">Voluntary Savings</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Mandatory Installment Target (৳)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="200"
            value={mandatoryAmount}
            onChange={(e) => setMandatoryAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Initial Deposit (৳)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="0"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(e.target.value)}
          />
        </div>
      </div>

      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading || loadingMembers || !selectedMember}>
          {isLoading ? 'Opening Account...' : 'Open Account'}
        </button>
      </div>
    </form>
  );
};

export default AccountModal;
