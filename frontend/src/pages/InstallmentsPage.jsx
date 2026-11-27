import React, { useState, useEffect } from 'react';
import { loanAPI, installmentAPI, employeeAPI } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';
import CollectInstallmentModal from '../components/installments/CollectInstallmentModal';
import ScheduleSimulatorModal from '../components/installments/ScheduleSimulatorModal';
import LoanScheduleViewerModal from '../components/installments/LoanScheduleViewerModal';

const InstallmentsPage = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPaymentsCount: 0,
    disbursedLoansCount: 0,
    totalPendingInstallmentCount: 0,
    totalPendingInstallmentAmount: 0,
  });
  const [officers, setOfficers] = useState([]);
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'payments'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Disbursed');

  // Modals
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedScheduleData, setSelectedScheduleData] = useState(null);
  const [collectingTarget, setCollectingTarget] = useState(null); // { loan, installment }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [loansRes, statsRes, paymentsRes, officersRes] = await Promise.all([
        loanAPI.getAll({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined,
        }),
        installmentAPI.getStats(),
        installmentAPI.getPayments({ limit: 50 }),
        employeeAPI.getAll({ isFieldOfficer: true }),
      ]);

      setLoans(loansRes.data.data || []);
      setStats(statsRes.data.data || {});
      setPayments(paymentsRes.data.data || []);
      setOfficers(officersRes.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load installment management data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenSchedule = async (loanId) => {
    try {
      const res = await installmentAPI.getSchedule(loanId);
      setSelectedScheduleData(res.data.data);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch schedule details',
      });
    }
  };

  const handleGenerateDisbursementSchedule = async (loanId) => {
    if (!window.confirm('Generate repayment schedule and disburse this loan?')) return;
    try {
      const res = await installmentAPI.generateSchedule(loanId);
      setAlert({
        type: 'success',
        message: res.data.message || 'Repayment schedule generated and loan disbursed successfully!',
      });
      fetchData();
      if (selectedScheduleData?.loan?._id === loanId) {
        handleOpenSchedule(loanId);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to generate schedule',
      });
    }
  };

  const handleCollectPayment = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await installmentAPI.collectPayment(payload);
      setAlert({
        type: 'success',
        message: res.data.message || 'Installment collection recorded successfully!',
      });
      setCollectingTarget(null);
      fetchData();

      // Refresh schedule viewer if opened
      if (selectedScheduleData?.loan?._id === payload.loanId) {
        handleOpenSchedule(payload.loanId);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record installment payment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Installment Management</h1>
          <p>SE331 Member 3 • Repayment Schedule Generation & Installment Collections (Module 2)</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setShowSimulator(true)}>
            ⚡ Schedule Simulator
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Module Scope Notice for SE331 Evaluator */}
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <span className="alert-icon">💳</span>
          <div>
            <strong>Member 3 Scope (Module 2):</strong> Automated calculation and generation of repayment schedules upon loan disbursement, along with collecting and recording installment payments with receipt generation. Integrated with Member 2's Loan Management and Member 1's Field Officers.
          </div>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* ─── Top Stats Cards ──────────────────────────────────────── */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              ৳{(stats.totalCollected || 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Installments Collected</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧾</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {stats.totalPaymentsCount || 0}
            </div>
            <div className="stat-label">Payment Receipts Issued</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>
              {stats.disbursedLoansCount || 0}
            </div>
            <div className="stat-label">Active Disbursed Loans</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {stats.totalPendingInstallmentCount || 0}
            </div>
            <div className="stat-label">Pending Installments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>
              ৳{(stats.totalPendingInstallmentAmount || 0).toLocaleString()}
            </div>
            <div className="stat-label">Outstanding Repayment Value</div>
          </div>
        </div>

        {/* ─── Tabs Navigation ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '8px' }}>
          <button
            className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('loans')}
          >
            📋 Disbursed Loans & Schedules ({loans.length})
          </button>
          <button
            className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('payments')}
          >
            🧾 Collection Receipts & Payment Ledger ({payments.length})
          </button>
        </div>

        {activeTab === 'loans' ? (
          <div>
            {/* Filter toolbar */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-body" style={{ padding: '14px' }}>
                <form onSubmit={handleSearchSubmit} className="toolbar" style={{ margin: 0 }}>
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by loan ID, member name or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <select
                    className="form-control"
                    style={{ width: 'auto', minWidth: '160px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="Disbursed">Active Disbursed Loans</option>
                    <option value="Approved">Approved (Awaiting Schedule)</option>
                    <option value="Closed">Closed (Fully Repaid)</option>
                    <option value="All">All Loan Statuses</option>
                  </select>

                  <button type="submit" className="btn btn-primary btn-sm">
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Loans & Repayment Schedules Table */}
            <div className="card">
              <div className="card-header">
                <h3>Loan Repayment Schedules ({loans.length})</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {isLoading ? (
                  <LoadingSpinner message="Loading loan schedules..." />
                ) : loans.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No loans found"
                    description="No loan applications match the current filter. Once loans are approved or disbursed, repayment schedules can be managed here."
                  />
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Loan ID</th>
                          <th>Member</th>
                          <th>Total Payable</th>
                          <th>Installment Plan</th>
                          <th>Collected / Balance</th>
                          <th>Repayment Progress</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((ln) => {
                          const totalInst = ln.installments?.length || 0;
                          const paidInst = (ln.installments || []).filter((i) => i.status === 'Paid').length;
                          const percent = totalInst > 0 ? Math.round((paidInst / totalInst) * 100) : 0;
                          const remaining = Math.max(0, ln.totalPayable - (ln.totalPaid || 0));

                          return (
                            <tr key={ln._id}>
                              <td>
                                <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{ln.loanId}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                  {ln.termType} • {ln.termDuration} installments
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{ln.member?.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                  {ln.member?.memberId} • {ln.member?.phone}
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                                  ৳{ln.totalPayable.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                  Principal: ৳{ln.principalAmount.toLocaleString()}
                                </div>
                              </td>
                              <td>
                                <div><strong>৳{ln.installmentAmount.toLocaleString()}</strong> / installment</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                  {paidInst} of {totalInst} paid
                                </div>
                              </td>
                              <td>
                                <div style={{ color: '#16a34a', fontWeight: 600 }}>
                                  ৳{(ln.totalPaid || 0).toLocaleString()}
                                </div>
                                <div style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                                  Bal: ৳{remaining.toLocaleString()}
                                </div>
                              </td>
                              <td style={{ width: '130px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                                  <span>{percent}%</span>
                                  <span>{paidInst}/{totalInst}</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#16a34a' : '#2563eb' }} />
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    ln.status === 'Disbursed'
                                      ? 'badge-active'
                                      : ln.status === 'Closed'
                                      ? 'badge-primary'
                                      : 'badge-inactive'
                                  }`}
                                >
                                  {ln.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                  {ln.status === 'Approved' && (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleGenerateDisbursementSchedule(ln._id)}
                                      title="Generate Schedule & Disburse"
                                    >
                                      🚀 Disburse
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleOpenSchedule(ln._id)}
                                    title="View Full Schedule & Installments"
                                  >
                                    👁️ Schedule ({totalInst})
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Payment Receipts & Collection Ledger */
          <div className="card">
            <div className="card-header">
              <h3>Installment Collection Receipts ({payments.length})</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {payments.length === 0 ? (
                <EmptyState
                  icon="🧾"
                  title="No collection records yet"
                  description="When field officers or administrators collect loan installments, digital payment receipts will be recorded here."
                />
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Loan ID</th>
                        <th>Member</th>
                        <th>Installment</th>
                        <th>Amount Paid</th>
                        <th>Method</th>
                        <th>Collector</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                              {p.receiptNumber}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace' }}>{p.loan?.loanId}</span>
                          </td>
                          <td>
                            <strong>{p.member?.fullName}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              {p.member?.memberId}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary">Installment #{p.installmentNumber}</span>
                          </td>
                          <td>
                            <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                              ৳{p.amount.toLocaleString()}
                            </strong>
                            {p.lateFine > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                                Fine: +৳{p.lateFine}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-field">{p.paymentMethod}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {p.collectorName || 'Field Officer'}
                            </div>
                          </td>
                          <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Schedule Simulator Modal ──────────────────────────────── */}
      <Modal
        isOpen={showSimulator}
        title="Repayment Schedule Calculation Simulator"
        onClose={() => setShowSimulator(false)}
      >
        <ScheduleSimulatorModal onClose={() => setShowSimulator(false)} />
      </Modal>

      {/* ─── Loan Schedule Viewer Modal ────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedScheduleData)}
        title="Detailed Repayment Schedule & Collections"
        onClose={() => setSelectedScheduleData(null)}
      >
        {selectedScheduleData && (
          <LoanScheduleViewerModal
            scheduleData={selectedScheduleData}
            onOpenCollect={(loan, inst) => {
              setCollectingTarget({ loan, installment: inst });
            }}
            onClose={() => setSelectedScheduleData(null)}
          />
        )}
      </Modal>

      {/* ─── Collect Installment Payment Modal ──────────────────────── */}
      <Modal
        isOpen={Boolean(collectingTarget)}
        title={`Record Installment Collection — Installment #${collectingTarget?.installment?.installmentNumber || ''}`}
        onClose={() => setCollectingTarget(null)}
      >
        {collectingTarget && (
          <CollectInstallmentModal
            loan={collectingTarget.loan}
            installment={collectingTarget.installment}
            officers={officers}
            onCollect={handleCollectPayment}
            onClose={() => setCollectingTarget(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default InstallmentsPage;
