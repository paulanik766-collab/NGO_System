import React, { useState } from 'react';

const EmployeeStatusModal = ({ employee, onUpdateStatus, onCancel, isSubmitting }) => {
  const [selectedStatus, setSelectedStatus] = useState(employee?.employmentStatus || 'Active');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(selectedStatus);
  };

  const statusOptions = [
    { value: 'Active', label: 'Active', desc: 'Currently working and available for assignments', badge: 'badge-active' },
    { value: 'On Leave', label: 'On Leave', desc: 'Temporarily on medical, annual or personal leave', badge: 'badge-leave' },
    { value: 'Probation', label: 'Probation', desc: 'Newly joined staff in probation period', badge: 'badge-probation' },
    { value: 'Inactive', label: 'Inactive', desc: 'Not currently active in NGO duties', badge: 'badge-inactive' },
    { value: 'Terminated', label: 'Terminated', desc: 'Employment contract completed or terminated', badge: 'badge-terminated' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '16px' }}>
          Select new employment status for <strong>{employee?.fullName}</strong> (
          <span style={{ fontFamily: 'monospace' }}>{employee?.employeeId}</span>):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {statusOptions.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: selectedStatus === opt.value ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                background: selectedStatus === opt.value ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="employmentStatus"
                value={opt.value}
                checked={selectedStatus === opt.value}
                onChange={() => setSelectedStatus(opt.value)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</span>
                  <span className={`badge ${opt.badge}`}>{opt.value}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  {opt.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Save New Status'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeStatusModal;
