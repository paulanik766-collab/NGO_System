import React, { useState, useEffect } from 'react';
import { dueOverdueAPI, loanAPI } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const DueOverduePage = () => {
  const [summary, setSummary] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [activeTab, setActiveTab] = useState('defaulters'); // 'defaulters' | 'upcoming'
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [riskFilter, setRiskFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Selected Defaulter Loan Detail Modal
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loanDetail, setLoanDetail] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, defRes, upcRes] = await Promise.all([
        dueOverdueAPI.getSummary(),
        dueOverdueAPI.getDefaulters({
          riskLevel: riskFilter !== 'All' ? riskFilter : undefined,
          search: search.trim() || undefined,
        }),
        dueOverdueAPI.getUpcoming({ days: 14 }),
      ]);

      setSummary(sumRes.data.data);
      setDefaulters(defRes.data.data || []);
      setUpcoming(upcRes.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load overdue and defaulters data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenLoanDetail = async (loanId) => {
    try {
      setSelectedLoanId(loanId);
      const res = await loanAPI.getById(loanId);
      setLoanDetail(res.data.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load loan details' });
    }
  };

  const handlePayInstallment = async (loanId, installmentNumber) => {
    try {
      const res = await loanAPI.payInstallment(loanId, installmentNumber);
      setAlert({ type: 'success', message: res.data.message });
      setLoanDetail(res.data.data);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Payment recording failed.' });
    }
  };

  const getRiskBadge = (risk) => {
    if (risk === 'Critical') {
      return (
        <span
          className="badge"
          style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
        >
          🚨 Critical (30+ Days)
        </span>
      );
    }
    if (risk === 'Moderate') {
      return (
        <span
          className="badge"
          style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600 }}
        >
          ⚠️ Moderate (16-30 Days)
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{ background: '#f1f5f9', color: '#475569' }}
      >
        Low (1-15 Days)
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Due & Overdue Management</h1>
          <p>Automated detection engine tracking past-due installments, risk analysis & real-time defaulters</p>
        </div>
      </div>

      <div className="page-content">
        <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

        {/* Analytics Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="stat-icon">⚠️</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>
              ৳{(summary?.totalOverdueAmount || 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Overdue Amount</div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #f97316' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-value" style={{ color: '#ea580c' }}>
              {summary?.defaulterCount || 0}
            </div>
            <div className="stat-label">Defaulter Members</div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #b91c1c' }}>
            <div className="stat-icon">🚨</div>
            <div className="stat-value" style={{ color: '#991b1b' }}>
              {summary?.criticalOverdueCount || 0}
            </div>
            <div className="stat-label">30+ Days Critical Overdue</div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="stat-icon">📅</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              ৳{(summary?.upcomingDueAmount || 0).toLocaleString()}
            </div>
            <div className="stat-label">Due Next 7 Days ({summary?.upcomingDueCount || 0} inst.)</div>
          </div>
        </div>

        {/* Tabs: Defaulters List vs Upcoming Due */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`btn ${activeTab === 'defaulters' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('defaulters')}
          >
            📋 Real-Time Defaulters List ({defaulters.length})
          </button>
          <button
            className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            ⏰ Upcoming Dues (Next 14 Days) ({upcoming.length})
          </button>
        </div>

        {activeTab === 'defaulters' ? (
          <>
            {/* Defaulter Filters */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="toolbar">
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search defaulter by name, member ID, phone, or loan ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">Search</button>
                    {search && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setSearch('');
                          setTimeout(fetchData, 0);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </form>

                  <select
                    className="form-control"
                    style={{ width: '200px' }}
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                  >
                    <option value="All">All Risk Levels</option>
                    <option value="Critical">Critical (30+ Days)</option>
                    <option value="Moderate">Moderate (16-30 Days)</option>
                    <option value="Low">Low (1-15 Days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Defaulters Table */}
            <div className="card">
              <div className="card-header">
                <h3>Active Defaulters & Overdue Ledger</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {isLoading ? (
                  <LoadingSpinner message="Scanning installments for defaulters..." />
                ) : defaulters.length === 0 ? (
                  <EmptyState
                    icon="🎉"
                    title="No Defaulters Found"
                    description="All members are currently up-to-date on their installment obligations."
                  />
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Loan ID</th>
                          <th>Overdue Installments</th>
                          <th>Overdue Amount</th>
                          <th>Days Past Due</th>
                          <th>Risk Classification</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {defaulters.map((item) => (
                          <tr key={item.loanObjectId}>
                            <td>
                              <strong>{item.member?.fullName || 'Unknown'}</strong>
                              <br />
                              <small style={{ color: '#64748b' }}>
                                {item.member?.memberId} • {item.member?.phone}
                              </small>
                            </td>
                            <td>
                              <strong>{item.loanId}</strong>
                            </td>
                            <td>{item.overdueInstallmentsCount} installment(s)</td>
                            <td>
                              <strong style={{ color: '#dc2626' }}>
                                ৳{item.totalOverdueAmount.toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <strong>{item.maxDaysOverdue} days</strong>
                            </td>
                            <td>{getRiskBadge(item.riskLevel)}</td>
                            <td>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                onClick={() => handleOpenLoanDetail(item.loanObjectId)}
                              >
                                View & Collect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Upcoming Dues Table */
          <div className="card">
            <div className="card-header">
              <h3>Installments Due Soon (Next 14 Days)</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {isLoading ? (
                <LoadingSpinner message="Loading upcoming dues..." />
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="No Upcoming Dues"
                  description="There are no installment deadlines in the next 14 days."
                />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Due Date</th>
                        <th>Days Remaining</th>
                        <th>Member</th>
                        <th>Loan ID</th>
                        <th>Installment #</th>
                        <th>Amount Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((u, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{new Date(u.dueDate).toLocaleDateString()}</strong>
                          </td>
                          <td>
                            {u.daysUntilDue === 0 ? (
                              <span style={{ color: '#ea580c', fontWeight: 700 }}>Due Today</span>
                            ) : (
                              <span>in {u.daysUntilDue} day(s)</span>
                            )}
                          </td>
                          <td>
                            <strong>{u.member?.fullName}</strong> ({u.member?.memberId})
                          </td>
                          <td>{u.loanId}</td>
                          <td>Installment #{u.installmentNumber}</td>
                          <td>
                            <strong>৳{u.amount.toLocaleString()}</strong>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => handleOpenLoanDetail(u.loanObjectId)}
                            >
                              Open Account
                            </button>
                          </td>
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

      {/* Modal: View Defaulter Account & Collect Payment */}
      <Modal
        isOpen={Boolean(selectedLoanId)}
        title={`Loan Account & Collections: ${loanDetail?.loanId || ''}`}
        onClose={() => {
          setSelectedLoanId(null);
          setLoanDetail(null);
        }}
      >
        {loanDetail && (
          <div>
            <div className="detail-grid mb-4">
              <div className="detail-item">
                <label>Member Name</label>
                <p>{loanDetail.member?.fullName}</p>
              </div>
              <div className="detail-item">
                <label>Member Contact</label>
                <p>{loanDetail.member?.phone}</p>
              </div>
              <div className="detail-item">
                <label>Total Loan Value</label>
                <p>৳{loanDetail.totalPayable.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Total Paid So Far</label>
                <p style={{ color: '#16a34a', fontWeight: 700 }}>৳{loanDetail.totalPaid.toLocaleString()}</p>
              </div>
            </div>

            <h4 style={{ marginBottom: '8px' }}>Installments & Overdue Action</h4>
            <div className="table-container" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loanDetail.installments?.map((inst) => {
                    const isOverdue = new Date(inst.dueDate) < new Date() && inst.status !== 'Paid';
                    return (
                      <tr key={inst._id || inst.installmentNumber}>
                        <td>{inst.installmentNumber}</td>
                        <td>
                          {new Date(inst.dueDate).toLocaleDateString()}
                          {isOverdue && (
                            <span style={{ color: '#dc2626', fontSize: '0.75rem', marginLeft: '6px' }}>
                              (Past Due)
                            </span>
                          )}
                        </td>
                        <td>৳{inst.amount.toLocaleString()}</td>
                        <td>
                          {inst.status === 'Paid' ? (
                            <span className="badge badge-active">Paid</span>
                          ) : isOverdue ? (
                            <span className="badge badge-danger">Overdue</span>
                          ) : (
                            <span className="badge badge-pending">Unpaid</span>
                          )}
                        </td>
                        <td>
                          {inst.status !== 'Paid' && (
                            <button
                              className="btn btn-success"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              onClick={() => handlePayInstallment(loanDetail._id, inst.installmentNumber)}
                            >
                              Collect & Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedLoanId(null);
                  setLoanDetail(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DueOverduePage;
