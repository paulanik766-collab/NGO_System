import React, { useState, useEffect } from 'react';

const TransactionModal = ({ accounts = [], preselectedAccount = null, onSubmit, onCancel, isLoading }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedAccount?._id || '');
  const [type, setType] = useState('Deposit');
  const [savingsType, setSavingsType] = useState('Mandatory');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [collectedBy, setCollectedBy] = useState('Field Officer');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (preselectedAccount?._id) {
      setSelectedAccountId(preselectedAccount._id);
    } else if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0]._id);
    }
  }, [preselectedAccount, accounts]);

  const selectedAccount = accounts.find((a) => a._id === selectedAccountId) || preselectedAccount;
  const currentBalance = selectedAccount ? selectedAccount.balance : 0;
  const numAmount = parseFloat(amount) || 0;

  const isInsufficient = type === 'Withdrawal' && numAmount > currentBalance;
  const newBalance =
    type === 'Deposit' ? currentBalance + numAmount : Math.max(0, currentBalance - numAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    if (numAmount <= 0) return;
    if (isInsufficient) return;

    onSubmit({
      accountId: selectedAccountId,
      type,
      savingsType,
      amount: numAmount,
      paymentMethod,
      collectedBy,
      remarks,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Savings Account / Member *</label>
        <select
          className="form-control"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          disabled={Boolean(preselectedAccount)}
          required
        >
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.accountNumber} — {acc.member?.fullName} ({acc.member?.memberId}) [Balance: ৳{acc.balance.toLocaleString()}]
            </option>
          ))}
        </select>
      </div>

      {selectedAccount && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Account Holder</div>
            <strong>{selectedAccount.member?.fullName}</strong>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Acc: {selectedAccount.accountNumber} ({selectedAccount.accountType})
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Balance</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>
              ৳{currentBalance.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Transaction Type *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${type === 'Deposit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setType('Deposit')}
            >
              📥 Deposit
            </button>
            <button
              type="button"
              className={`btn ${type === 'Withdrawal' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setType('Withdrawal')}
            >
              📤 Withdrawal
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Savings Category *</label>
          <select
            className="form-control"
            value={savingsType}
            onChange={(e) => setSavingsType(e.target.value)}
            required
          >
            <option value="Mandatory">Mandatory Savings</option>
            <option value="Voluntary">Voluntary Savings</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Amount (৳) *</label>
        <input
          type="number"
          min="1"
          step="any"
          className="form-control"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        {isInsufficient && (
          <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>
            ⚠️ Insufficient funds! Current available balance is ৳{currentBalance.toLocaleString()}.
          </div>
        )}
      </div>

      {numAmount > 0 && !isInsufficient && (
        <div
          style={{
            background: type === 'Deposit' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${type === 'Deposit' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Real-time Updated Balance:</span>
          <strong style={{ color: type === 'Deposit' ? '#166534' : '#991b1b' }}>
            ৳{newBalance.toLocaleString()}
          </strong>
        </div>
      )}

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
          <label className="form-label">Collected / Processed By</label>
          <input
            type="text"
            className="form-control"
            value={collectedBy}
            onChange={(e) => setCollectedBy(e.target.value)}
            placeholder="Field Officer or Staff Name"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Remarks / Note</label>
        <input
          type="text"
          className="form-control"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Weekly collection center deposit"
        />
      </div>

      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || isInsufficient || numAmount <= 0}
        >
          {isLoading ? 'Processing...' : `Confirm ${type}`}
        </button>
      </div>
    </form>
  );
};

export default TransactionModal;
