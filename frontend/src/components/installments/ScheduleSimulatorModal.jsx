import React, { useState } from 'react';
import { installmentAPI } from '../../services/api';

const ScheduleSimulatorModal = ({ onClose }) => {
  const [params, setParams] = useState({
    principalAmount: 25000,
    interestRate: 10,
    termDuration: 12,
    termType: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [previewData, setPreviewData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    try {
      const res = await installmentAPI.previewSchedule(params);
      setPreviewData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to simulate schedule');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '16px' }}>
        Simulate automated repayment schedule generation with customizable loan amount, interest rate, term duration, and payment frequency.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSimulate}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Principal Amount (BDT)</label>
            <input
              type="number"
              min="1000"
              className="form-control"
              value={params.principalAmount}
              onChange={(e) => setParams({ ...params, principalAmount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interest Rate (%)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              className="form-control"
              value={params.interestRate}
              onChange={(e) => setParams({ ...params, interestRate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Term Frequency</label>
            <select
              className="form-control"
              value={params.termType}
              onChange={(e) => setParams({ ...params, termType: e.target.value })}
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration ({params.termType === 'Weekly' ? 'Weeks' : 'Months'})</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={params.termDuration}
              onChange={(e) => setParams({ ...params, termDuration: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Disbursement Date</label>
            <input
              type="date"
              className="form-control"
              value={params.startDate}
              onChange={(e) => setParams({ ...params, startDate: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-sm" disabled={isCalculating} style={{ marginBottom: '20px' }}>
          {isCalculating ? 'Generating...' : '⚡ Generate Repayment Schedule Preview'}
        </button>
      </form>

      {previewData && (
        <div>
          {/* Summary Financials Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Principal</div>
              <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>৳{previewData.financials.principalAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Interest</div>
              <div style={{ fontWeight: 700, color: '#0891b2' }}>৳{previewData.financials.totalInterest.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Payable</div>
              <div style={{ fontWeight: 700, color: '#2563eb' }}>৳{previewData.financials.totalPayable.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Installment Amount</div>
              <div style={{ fontWeight: 700, color: '#16a34a' }}>৳{previewData.financials.installmentAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Installments</div>
              <div style={{ fontWeight: 700, color: '#7c3aed' }}>{previewData.schedule.length} installments</div>
            </div>
          </div>

          {/* Generated Schedule Table */}
          <div className="table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scheduled Due Date</th>
                  <th>Installment Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.schedule.map((inst) => (
                  <tr key={inst.installmentNumber}>
                    <td>{inst.installmentNumber}</td>
                    <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                    <td>৳{inst.amount.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-inactive">Unpaid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, marginTop: '16px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ScheduleSimulatorModal;
