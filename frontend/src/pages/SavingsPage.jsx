import React, { useState, useEffect } from 'react';
import { savingsAPI } from '../services/api';
import SavingsStats from '../components/savings/SavingsStats';
import SavingsLedgerTable from '../components/savings/SavingsLedgerTable';
import SavingsAccountTable from '../components/savings/SavingsAccountTable';
import TransactionModal from '../components/savings/TransactionModal';
import AccountModal from '../components/savings/AccountModal';
import MemberPassbookModal from '../components/savings/MemberPassbookModal';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const SavingsPage = () => {
  const [activeTab, setActiveTab] = useState('ledger');
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters for ledger
  const [ledgerType, setLedgerType] = useState('');
  const [savingsCategory, setSavingsCategory] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Filters for accounts
  const [accountSearch, setAccountSearch] = useState('');
  const [accountStatus, setAccountStatus] = useState('');

  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [preselectedAccount, setPreselectedAccount] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [viewingPassbookAccount, setViewingPassbookAccount] = useState(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, accountsRes, ledgerRes] = await Promise.all([
        savingsAPI.getStats(),
        savingsAPI.getAccounts({
          search: accountSearch.trim() || undefined,
          status: accountStatus || undefined,
          limit: 100,
        }),
        savingsAPI.getLedger({
          type: ledgerType || undefined,
          savingsType: savingsCategory || undefined,
          search: ledgerSearch.trim() || undefined,
          limit: 100,
        }),
      ]);

      setStats(statsRes.data.data);
      setAccounts(accountsRes.data.data || []);
      setLedgerEntries(ledgerRes.data.data || []);
      setLedgerSummary(ledgerRes.data.summary);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load savings data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [ledgerType, savingsCategory, accountStatus]);

  const handleSearchLedger = (e) => {
    e.preventDefault();
    fetchAllData();
  };

  const handleSearchAccounts = (e) => {
    e.preventDefault();
    fetchAllData();
  };

  const handleOpenTransactionModal = (account = null) => {
    setPreselectedAccount(account);
    setShowTransactionModal(true);
  };

  const handleLogTransaction = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await savingsAPI.createTransaction(formData);
      setAlert({
        type: 'success',
        message: `${res.data.message}! Updated Balance: ৳${res.data.data?.newBalance?.toLocaleString()}`,
      });
      setShowTransactionModal(false);
      setPreselectedAccount(null);
      await fetchAllData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record transaction.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAccount = async (formData) => {
    setIsSubmitting(true);
    try {
      await savingsAPI.createAccount(formData);
      setAlert({ type: 'success', message: 'Savings account opened successfully!' });
      setShowAccountModal(false);
      await fetchAllData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to open savings account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Savings Management</h1>
          <p>Dedicated savings ledger for mandatory & voluntary deposits, withdrawals, and real-time balances</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setShowAccountModal(true)}>
            + Open Savings Account
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenTransactionModal(null)}>
            ± Log Deposit / Withdrawal
          </button>
        </div>
      </div>

      <div className="page-content">
        <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

        <SavingsStats stats={stats} />

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #cbd5e1', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: activeTab === 'ledger' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'ledger' ? '3px solid #2563eb' : '3px solid transparent',
            }}
          >
            📒 Dedicated Savings Ledger ({ledgerEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: activeTab === 'accounts' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'accounts' ? '3px solid #2563eb' : '3px solid transparent',
            }}
          >
            💳 Member Savings Accounts ({accounts.length})
          </button>
        </div>

        {/* TAB 1: DEDICATED SAVINGS LEDGER */}
        {activeTab === 'ledger' && (
          <div>
            <div className="card mb-4">
              <div className="card-body">
                <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <form onSubmit={handleSearchLedger} style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '8px' }}>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Txn ID, remarks, collector..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                      Search
                    </button>
                    {ledgerSearch && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setLedgerSearch('');
                          setTimeout(fetchAllData, 0);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </form>

                  <select
                    className="form-control"
                    style={{ width: '160px' }}
                    value={ledgerType}
                    onChange={(e) => setLedgerType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Deposit">Deposits Only</option>
                    <option value="Withdrawal">Withdrawals Only</option>
                  </select>

                  <select
                    className="form-control"
                    style={{ width: '180px' }}
                    value={savingsCategory}
                    onChange={(e) => setSavingsCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Mandatory">Mandatory Savings</option>
                    <option value="Voluntary">Voluntary Savings</option>
                  </select>
                </div>
              </div>
            </div>

            {ledgerSummary && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  Deposits in Ledger:{' '}
                  <strong style={{ color: '#16a34a' }}>
                    ৳{(ledgerSummary.totalDeposits || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  Withdrawals in Ledger:{' '}
                  <strong style={{ color: '#dc2626' }}>
                    ৳{(ledgerSummary.totalWithdrawals || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  Net Ledger Flow:{' '}
                  <strong style={{ color: '#2563eb' }}>
                    ৳{(ledgerSummary.netSavings || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h3>Transactions Ledger Statement</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {isLoading ? (
                  <LoadingSpinner message="Loading savings ledger..." />
                ) : ledgerEntries.length === 0 ? (
                  <EmptyState
                    icon="📒"
                    title="No savings transactions recorded"
                    description="Click 'Log Deposit / Withdrawal' to log your first savings entry."
                  />
                ) : (
                  <SavingsLedgerTable entries={ledgerEntries} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVINGS ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div>
            <div className="card mb-4">
              <div className="card-body">
                <div className="toolbar">
                  <form onSubmit={handleSearchAccounts} style={{ display: 'flex', flex: 1, gap: '8px' }}>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by member name, phone, or account number..."
                        value={accountSearch}
                        onChange={(e) => setAccountSearch(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                      Search
                    </button>
                    {accountSearch && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setAccountSearch('');
                          setTimeout(fetchAllData, 0);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </form>

                  <select
                    className="form-control"
                    style={{ width: '160px' }}
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Dormant">Dormant Only</option>
                    <option value="Closed">Closed Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Active Member Savings Accounts</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {isLoading ? (
                  <LoadingSpinner message="Loading savings accounts..." />
                ) : accounts.length === 0 ? (
                  <EmptyState
                    icon="💳"
                    title="No savings accounts found"
                    description="Click 'Open Savings Account' to open an account for an active member."
                  />
                ) : (
                  <SavingsAccountTable
                    accounts={accounts}
                    onTransact={(acc) => handleOpenTransactionModal(acc)}
                    onViewPassbook={(acc) => setViewingPassbookAccount(acc)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Log Deposit / Withdrawal */}
      <Modal
        isOpen={showTransactionModal}
        title={preselectedAccount ? `Log Transaction: ${preselectedAccount.accountNumber}` : 'Log Savings Transaction'}
        onClose={() => {
          setShowTransactionModal(false);
          setPreselectedAccount(null);
        }}
      >
        <TransactionModal
          accounts={accounts.filter((a) => a.status === 'Active')}
          preselectedAccount={preselectedAccount}
          onSubmit={handleLogTransaction}
          onCancel={() => {
            setShowTransactionModal(false);
            setPreselectedAccount(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: Open Savings Account */}
      <Modal
        isOpen={showAccountModal}
        title="Open New Member Savings Account"
        onClose={() => setShowAccountModal(false)}
      >
        <AccountModal
          onSubmit={handleOpenAccount}
          onCancel={() => setShowAccountModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: Passbook Statement */}
      <Modal
        isOpen={Boolean(viewingPassbookAccount)}
        title="Member Savings Passbook"
        onClose={() => setViewingPassbookAccount(null)}
      >
        <MemberPassbookModal
          account={viewingPassbookAccount}
          onClose={() => setViewingPassbookAccount(null)}
        />
      </Modal>
    </div>
  );
};

export default SavingsPage;
