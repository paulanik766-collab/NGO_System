import React, { useState, useEffect } from 'react';
import { loanAPI, memberAPI } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Application Form State
  const [formData, setFormData] = useState({
    member: '',
    principalAmount: 20000,
    interestRate: 10,
    termDuration: 12,
    termType: 'Monthly',
    purpose: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live calculation preview
  const calculatePreview = () => {
    const p = Number(formData.principalAmount) || 0;
    const r = Number(formData.interestRate) || 0;
    const d = Number(formData.termDuration) || 1;
    const years = formData.termType === 'Weekly' ? d / 52 : d / 12;
    const totalInterest = Math.round((p * r * years) / 100);
    const totalPayable = p + totalInterest;
    const installmentAmount = Math.ceil(totalPayable / d);
    return { totalInterest, totalPayable, installmentAmount };
  };

  const preview = calculatePreview();

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = await loanAPI.getAll({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setLoans(res.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load loan applications',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await memberAPI.getAll({ limit: 200 });
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load members for loan form:', err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLoans();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.member) errors.member = 'Please select a member.';
    if (!formData.principalAmount || formData.principalAmount < 1000) {
      errors.principalAmount = 'Principal must be at least 1,000 BDT.';
    }
    if (formData.interestRate === undefined || formData.interestRate < 0) {
      errors.interestRate = 'Valid interest rate is required.';
    }
    if (!formData.termDuration || formData.termDuration < 1) {
      errors.termDuration = 'Term duration must be at least 1.';
    }
    if (!formData.purpose.trim()) {
      errors.purpose = 'Loan purpose is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await loanAPI.create(formData);
      setAlert({ type: 'success', message: res.data.message });
      setShowApplyModal(false);
      setFormData({
        member: '',
        principalAmount: 20000,
        interestRate: 10,
        termDuration: 12,
        termType: 'Monthly',
        purpose: '',
      });
      fetchLoans();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit loan application.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (loanId, newStatus, rejectionReason = '') => {
    try {
      const res = await loanAPI.updateStatus(loanId, { status: newStatus, rejectionReason });
      setAlert({ type: 'success', message: res.data.message });
      if (selectedLoan && selectedLoan._id === loanId) {
        setSelectedLoan(res.data.data);
      }
      fetchLoans();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || `Failed to update status to ${newStatus}`,
      });
    }
  };

  const handlePayInstallment = async (loanId, installmentNumber) => {
    try {
      const res = await loanAPI.payInstallment(loanId, installmentNumber);
      setAlert({ type: 'success', message: res.data.message });
      setSelectedLoan(res.data.data);
      fetchLoans();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Payment recording failed.',
      });
    }
  };

  const getStatusBadge = (status) => {
    const badgeMap = {
      Pending: 'badge-pending',
      Approved: 'badge-info',
      Disbursed: 'badge-active',
      Closed: 'badge-inactive',
      Rejected: 'badge-danger',
    };
    return <span className={`badge ${badgeMap[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Loan Management</h1>
          <p>Credit & microfinance loan applications, interest configurations, and repayment tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
          + Apply for Loan
        </button>
      </div>

      <div className="page-content">
        <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

        {/* Toolbar & Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="toolbar">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by loan ID, member name or ID..."
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
                      setTimeout(fetchLoans, 0);
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>

              <select
                className="form-control"
                style={{ width: '180px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed (Active)</option>
                <option value="Closed">Closed (Completed)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="card">
          <div className="card-header">
            <h3>Loan Applications & Accounts ({loans.length})</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading loan records..." />
            ) : loans.length === 0 ? (
              <EmptyState
                icon="💵"
                title="No loan applications found"
                description={
                  search || statusFilter
                    ? 'No loans match your filter criteria.'
                    : 'Click "+ Apply for Loan" to create a new micro-loan application.'
                }
              />
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Member</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Total Payable</th>
                      <th>Installment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan._id}>
                        <td>
                          <strong>{loan.loanId}</strong>
                        </td>
                        <td>
                          <div>{loan.member?.fullName || 'Unknown'}</div>
                          <small style={{ color: '#64748b' }}>{loan.member?.memberId}</small>
                        </td>
                        <td>৳{loan.principalAmount.toLocaleString()}</td>
                        <td>{loan.interestRate}% (৳{loan.totalInterest.toLocaleString()})</td>
                        <td>
                          <strong>৳{loan.totalPayable.toLocaleString()}</strong>
                        </td>
                        <td>
                          ৳{loan.installmentAmount.toLocaleString()}/{loan.termType === 'Weekly' ? 'wk' : 'mo'}
                          <br />
                          <small style={{ color: '#64748b' }}>{loan.termDuration} installments</small>
                        </td>
                        <td>{getStatusBadge(loan.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => setSelectedLoan(loan)}
                            >
                              View / Schedule
                            </button>

                            {loan.status === 'Pending' && (
                              <>
                                <button
                                  className="btn btn-success"
                                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                  onClick={() => handleStatusTransition(loan._id, 'Approved')}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    const reason = window.prompt('Enter rejection reason:');
                                    if (reason !== null) {
                                      handleStatusTransition(loan._id, 'Rejected', reason);
                                    }
                                  }}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}

                            {loan.status === 'Approved' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                onClick={() => handleStatusTransition(loan._id, 'Disbursed')}
                              >
                                🚀 Disburse Loan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Apply for Loan */}
      <Modal isOpen={showApplyModal} title="New Micro-Loan Application" onClose={() => setShowApplyModal(false)}>
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">
              Applicant Member <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className={`form-control ${formErrors.member ? 'is-invalid' : ''}`}
              value={formData.member}
              onChange={(e) => setFormData({ ...formData, member: e.target.value })}
            >
              <option value="">— Select a registered member —</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.memberId} — {m.fullName} ({m.phone})
                </option>
              ))}
            </select>
            {formErrors.member && <div className="form-error">{formErrors.member}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">
                Principal Amount (BDT) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                className={`form-control ${formErrors.principalAmount ? 'is-invalid' : ''}`}
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
              />
              {formErrors.principalAmount && <div className="form-error">{formErrors.principalAmount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Annual Interest Rate (%) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                className={`form-control ${formErrors.interestRate ? 'is-invalid' : ''}`}
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              />
              {formErrors.interestRate && <div className="form-error">{formErrors.interestRate}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Term Frequency</label>
              <select
                className="form-control"
                value={formData.termType}
                onChange={(e) => setFormData({ ...formData, termType: e.target.value })}
              >
                <option value="Monthly">Monthly Installments</option>
                <option value="Weekly">Weekly Installments</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Duration ({formData.termType === 'Weekly' ? 'Weeks' : 'Months'}) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`form-control ${formErrors.termDuration ? 'is-invalid' : ''}`}
                value={formData.termDuration}
                onChange={(e) => setFormData({ ...formData, termDuration: e.target.value })}
              />
              {formErrors.termDuration && <div className="form-error">{formErrors.termDuration}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Loan Purpose <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Grocery store setup, agricultural equipment..."
              className={`form-control ${formErrors.purpose ? 'is-invalid' : ''}`}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
            {formErrors.purpose && <div className="form-error">{formErrors.purpose}</div>}
          </div>

          {/* Live Calculation Preview Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Financial Breakdown Preview:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div>
                <small style={{ color: '#64748b' }}>Total Interest:</small>
                <div style={{ fontWeight: 600 }}>৳{preview.totalInterest.toLocaleString()}</div>
              </div>
              <div>
                <small style={{ color: '#64748b' }}>Total Payable:</small>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>৳{preview.totalPayable.toLocaleString()}</div>
              </div>
              <div>
                <small style={{ color: '#64748b' }}>Periodic Installment:</small>
                <div style={{ fontWeight: 600, color: '#16a34a' }}>
                  ৳{preview.installmentAmount.toLocaleString()}/{formData.termType === 'Weekly' ? 'wk' : 'mo'}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '12px 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowApplyModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Loan & Installment Schedule */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        title={`Loan Account: ${selectedLoan?.loanId || ''}`}
        onClose={() => setSelectedLoan(null)}
      >
        {selectedLoan && (
          <div>
            <div className="detail-grid mb-4">
              <div className="detail-item">
                <label>Member</label>
                <p>{selectedLoan.member?.fullName || 'Unknown'}</p>
              </div>
              <div className="detail-item">
                <label>Member ID / Phone</label>
                <p>
                  {selectedLoan.member?.memberId} • {selectedLoan.member?.phone}
                </p>
              </div>
              <div className="detail-item">
                <label>Principal Amount</label>
                <p>৳{selectedLoan.principalAmount.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Total Payable</label>
                <p style={{ color: '#2563eb', fontWeight: 700 }}>৳{selectedLoan.totalPayable.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Total Paid So Far</label>
                <p style={{ color: '#16a34a', fontWeight: 700 }}>৳{selectedLoan.totalPaid.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Remaining Balance</label>
                <p style={{ color: '#dc2626', fontWeight: 700 }}>
                  ৳{Math.max(0, selectedLoan.totalPayable - selectedLoan.totalPaid).toLocaleString()}
                </p>
              </div>
              <div className="detail-item">
                <label>Loan Status</label>
                <p>{getStatusBadge(selectedLoan.status)}</p>
              </div>
              <div className="detail-item">
                <label>Purpose</label>
                <p>{selectedLoan.purpose}</p>
              </div>
            </div>

            {/* Repayment Schedule */}
            <h4 style={{ marginBottom: '8px' }}>Repayment Schedule ({selectedLoan.installments?.length || 0})</h4>
            {selectedLoan.installments && selectedLoan.installments.length > 0 ? (
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
                    {selectedLoan.installments.map((inst) => {
                      const isPastDue = new Date(inst.dueDate) < new Date() && inst.status !== 'Paid';
                      return (
                        <tr key={inst._id || inst.installmentNumber}>
                          <td>{inst.installmentNumber}</td>
                          <td>
                            {new Date(inst.dueDate).toLocaleDateString()}
                            {isPastDue && (
                              <span style={{ color: '#dc2626', fontSize: '0.75rem', marginLeft: '6px' }}>
                                (Overdue)
                              </span>
                            )}
                          </td>
                          <td>৳{inst.amount.toLocaleString()}</td>
                          <td>
                            {inst.status === 'Paid' ? (
                              <span className="badge badge-active">Paid</span>
                            ) : isPastDue ? (
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
                                onClick={() => handlePayInstallment(selectedLoan._id, inst.installmentNumber)}
                              >
                                Record Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Installment schedule will be generated automatically once the loan is <strong>Disbursed</strong>.
              </p>
            )}

            <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoansPage;
