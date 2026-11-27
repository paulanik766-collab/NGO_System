import React, { useState, useEffect } from 'react';
import { memberAPI } from '../../services/api';

const ReceiptFormModal = ({ onSubmit, onCancel, isLoading }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [collectionType, setCollectionType] = useState('Savings Deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [collectedBy, setCollectedBy] = useState('Field Officer');
  const [remarks, setRemarks] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.getAll({ status: 'Active', limit: 100 });
        const list = res.data.data || [];
        setMembers(list);
        if (list.length > 0) {
          setSelectedMember(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load members', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember || !amount || Number(amount) <= 0) return;

    onSubmit({
      member: selectedMember,
      collectionType,
      amount: Number(amount),
      paymentMethod,
      collectedBy,
      remarks,
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
          <label className="form-label">Collection Type *</label>
          <select
            className="form-control"
            value={collectionType}
            onChange={(e) => setCollectionType(e.target.value)}
            required
          >
            <option value="Savings Deposit">Savings Deposit</option>
            <option value="Loan Installment">Loan Installment</option>
            <option value="Membership Fee">Membership Fee</option>
            <option value="Other Collection">Other Collection</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Amount (৳) *</label>
          <input
            type="number"
            min="1"
            className="form-control"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select
            className="form-control"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Collected By</label>
          <input
            type="text"
            className="form-control"
            placeholder="Field Officer Name"
            value={collectedBy}
            onChange={(e) => setCollectedBy(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Remarks / Note</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Weekly field collection"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading || loadingMembers || !selectedMember}>
          {isLoading ? 'Generating...' : 'Generate Receipt'}
        </button>
      </div>
    </form>
  );
};

export default ReceiptFormModal;
