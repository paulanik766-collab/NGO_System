import React from 'react';

const EmployeeDetail = ({ employee, activeAssignmentsCount = 0, onEdit, onChangeStatus, onClose }) => {
  if (!employee) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="badge badge-active">Active</span>;
      case 'Inactive':
        return <span className="badge badge-inactive">Inactive</span>;
      case 'On Leave':
        return <span className="badge badge-leave">On Leave</span>;
      case 'Probation':
        return <span className="badge badge-probation">Probation</span>;
      case 'Terminated':
        return <span className="badge badge-terminated">Terminated</span>;
      default:
        return <span className="badge badge-inactive">{status}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EMP';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formattedDate = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not Specified';

  return (
    <div>
      {/* Header Profile Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--gray-200)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: employee.staffType === 'Administrative' ? '#e0e7ff' : '#dcfce7',
            color: employee.staffType === 'Administrative' ? '#4338ca' : '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          {getInitials(employee.fullName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
              {employee.fullName}
            </h3>
            {getStatusBadge(employee.employmentStatus)}
            <span
              className={`badge ${
                employee.staffType === 'Administrative' ? 'badge-admin' : 'badge-field'
              }`}
            >
              {employee.staffType}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '4px' }}>
            <strong>{employee.designation}</strong> • {employee.department} •{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{employee.employeeId}</span>
          </div>
        </div>
      </div>

      {/* Field Officer Integration Banner */}
      {employee.isFieldOfficer && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--border-radius)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong>✓ Field Officer Status:</strong> Eligible for Member 1 field tracking & member assignments.
          </div>
          {activeAssignmentsCount > 0 ? (
            <span className="badge badge-active">
              {activeAssignmentsCount} Active Assignment{activeAssignmentsCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="badge badge-inactive">No active field assignments</span>
          )}
        </div>
      )}

      {/* Detailed Grid */}
      <div className="detail-grid" style={{ marginBottom: '20px' }}>
        <div className="detail-item">
          <label>Employee ID</label>
          <p style={{ fontFamily: 'monospace' }}>{employee.employeeId}</p>
        </div>
        <div className="detail-item">
          <label>Staff Type</label>
          <p>{employee.staffType}</p>
        </div>
        <div className="detail-item">
          <label>Designation</label>
          <p>{employee.designation}</p>
        </div>
        <div className="detail-item">
          <label>Department</label>
          <p>{employee.department}</p>
        </div>
        <div className="detail-item">
          <label>Phone Number</label>
          <p>{employee.phone}</p>
        </div>
        <div className="detail-item">
          <label>Email Address</label>
          <p>{employee.email || '—'}</p>
        </div>
        <div className="detail-item">
          <label>Employment Status</label>
          <p>{employee.employmentStatus}</p>
        </div>
        <div className="detail-item">
          <label>Joining Date</label>
          <p>{formattedDate}</p>
        </div>
        <div className="detail-item">
          <label>Monthly Salary</label>
          <p>{employee.salary ? `৳ ${employee.salary.toLocaleString()} BDT` : 'Confidential / Unset'}</p>
        </div>
        <div className="detail-item">
          <label>National ID (NID)</label>
          <p>{employee.nidNumber || '—'}</p>
        </div>
        <div className="detail-item">
          <label>Blood Group</label>
          <p>{employee.bloodGroup || '—'}</p>
        </div>
        <div className="detail-item">
          <label>Field Eligibility</label>
          <p>{employee.isFieldOfficer ? 'Yes (Field Officer)' : 'No (Office Only)'}</p>
        </div>
      </div>

      {employee.address && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Residential Address
          </label>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-800)', marginTop: '4px' }}>
            {employee.address}
          </p>
        </div>
      )}

      {(employee.emergencyContact?.name || employee.emergencyContact?.phone) && (
        <div
          style={{
            background: 'var(--gray-50)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius)',
            marginBottom: '16px',
            border: '1px solid var(--gray-200)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Emergency Contact
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-800)' }}>
            <strong>{employee.emergencyContact.name || 'Not provided'}</strong>
            {employee.emergencyContact.relation && ` (${employee.emergencyContact.relation})`}
            {employee.emergencyContact.phone && ` — ${employee.emergencyContact.phone}`}
          </div>
        </div>
      )}

      {employee.notes && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administrative Notes
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginTop: '4px', background: 'var(--gray-50)', padding: '10px', borderRadius: '6px' }}>
            {employee.notes}
          </p>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <button
          className="btn btn-secondary"
          onClick={() => {
            onClose();
            onChangeStatus(employee);
          }}
        >
          🔄 Change Status
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            onClose();
            onEdit(employee);
          }}
        >
          ✏️ Edit Profile
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EmployeeDetail;
