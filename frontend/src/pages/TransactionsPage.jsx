import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import RecordTransactionModal from '../components/transactions/RecordTransactionModal';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netBalance: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedMethod) params.paymentMethod = selectedMethod;
      if (selectedStatus) params.status = selectedStatus;

      const [txRes, statsRes] = await Promise.all([
        transactionAPI.getAll(params),
        transactionAPI.getStats(),
      ]);

      if (txRes.data?.success) {
        setTransactions(txRes.data.transactions);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
    } catch {
      setTransactions([
        {
          _id: 'tx-1',
          transactionId: 'TRX-M3-001',
          type: 'installment_payment',
          category: 'credit',
          amount: 2500,
          member: { fullName: 'Rahima Begum', memberId: 'MBR-9001' },
          paymentMethod: 'bKash',
          status: 'Completed',
          referenceId: 'RCP-202611-001',
          performedBy: 'Field Officer Anik',
          transactionDate: new Date(),
          remarks: 'Weekly installment #1',
        },
        {
          _id: 'tx-2',
          transactionId: 'TRX-M3-002',
          type: 'loan_disbursement',
          category: 'debit',
          amount: 20000,
          member: { fullName: 'Abdul Karim', memberId: 'MBR-9002' },
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          referenceId: 'LN-1001',
          performedBy: 'Loan Officer Ratul',
          transactionDate: new Date(Date.now() - 3600000),
          remarks: 'Micro-enterprise loan disbursement',
        },
        {
          _id: 'tx-3',
          transactionId: 'TRX-M3-003',
          type: 'savings_deposit',
          category: 'credit',
          amount: 1000,
          member: { fullName: 'Fatema Khatun', memberId: 'MBR-9003' },
          paymentMethod: 'Cash',
          status: 'Completed',
          referenceId: 'TXN-SAV-003',
          performedBy: 'Branch Staff',
          transactionDate: new Date(Date.now() - 7200000),
          remarks: 'Monthly voluntary savings deposit',
        },
      ]);
      setStats({
        totalInflow: 3500,
        totalOutflow: 20000,
        netBalance: -16500,
        totalTransactions: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType, selectedCategory, selectedMethod, selectedStatus]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NGO_Ledger_Transactions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount (BDT)', 'Member Name', 'Member ID', 'Payment Method', 'Reference', 'Status', 'Performed By'];
    const rows = transactions.map((t) => [
      t.transactionId,
      new Date(t.transactionDate).toISOString(),
      t.type,
      t.category,
      t.amount,
      `"${t.member?.fullName || t.member?.name || 'N/A'}"`,
      t.member?.memberId || t.member?.accountNumber || 'N/A',
      t.paymentMethod,
      t.referenceId || '',
      t.status,
      `"${t.performedBy || 'System'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NGO_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatCurrency = (amt) => `৳${Number(amt || 0).toLocaleString()}`;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'installment_payment':
        return <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>Installment</span>;
      case 'loan_disbursement':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>Disbursement</span>;
      case 'savings_deposit':
        return <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Savings Dep</span>;
      case 'savings_withdrawal':
        return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>Savings W/D</span>;
      case 'fee_payment':
        return <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 600 }}>Fee</span>;
      default:
        return <span className="badge badge-secondary">{type}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.75rem' }}>📑</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Central Unified Transaction Ledger
            </h1>
          </div>
          <p style={{ color: '#64748b', margin: 0 }}>
            Member 3 (Module 3) • Unified financial records for loans, installment collections, and savings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportJSON}
          >
            📥 Export JSON
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsRecordOpen(true)}
          >
            + Record Transaction
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Inflow (Credits)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', margin: '6px 0 2px' }}>
            {formatCurrency(stats.totalInflow)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Installments, savings deposits & fees</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Outflow (Debits)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', margin: '6px 0 2px' }}>
            {formatCurrency(stats.totalOutflow)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Loan disbursements & withdrawals</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Net Ledger Balance
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats.netBalance >= 0 ? '#2563eb' : '#dc2626', margin: '6px 0 2px' }}>
            {formatCurrency(stats.netBalance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time net cash flow</div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Movements
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', margin: '6px 0 2px' }}>
            {stats.totalTransactions}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Audited ledger records</div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by TRX ID, Member, or Reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
            />
          </div>

          <div style={{ flex: '0 1 170px' }}>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="installment_payment">Installment</option>
              <option value="loan_disbursement">Disbursement</option>
              <option value="savings_deposit">Savings Deposit</option>
              <option value="savings_withdrawal">Savings Withdrawal</option>
              <option value="fee_payment">Fee Payment</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Flows</option>
              <option value="credit">Credit (Inflow +)</option>
              <option value="debit">Debit (Outflow -)</option>
            </select>
          </div>

          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-control"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchTransactions}
          >
            Filter
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading unified ledger...</div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.8125rem' }}>
                  <th style={{ padding: '12px 14px' }}>TRX ID</th>
                  <th style={{ padding: '12px 14px' }}>DATE</th>
                  <th style={{ padding: '12px 14px' }}>TYPE</th>
                  <th style={{ padding: '12px 14px' }}>MEMBER</th>
                  <th style={{ padding: '12px 14px' }}>METHOD</th>
                  <th style={{ padding: '12px 14px' }}>REFERENCE</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No ledger transactions found matching filters.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.category === 'credit';
                    return (
                      <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                            {tx.transactionId}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8125rem', color: '#64748b' }}>
                          {new Date(tx.transactionDate).toLocaleDateString()}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {getTypeBadge(tx.type)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {tx.member?.fullName || tx.member?.name || 'Unknown Member'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {tx.member?.memberId || tx.member?.accountNumber || ''}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.875rem' }}>
                          {tx.paymentMethod}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8125rem', fontFamily: 'monospace', color: '#475569' }}>
                          {tx.referenceId || '—'}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isCredit ? '#16a34a' : '#dc2626',
                        }}>
                          {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setSelectedTransaction(tx);
                              setIsDetailOpen(true);
                            }}
                          >
                            Voucher
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTransaction}
      />

      <RecordTransactionModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onTransactionCreated={fetchTransactions}
      />
    </div>
  );
};

export default TransactionsPage;
