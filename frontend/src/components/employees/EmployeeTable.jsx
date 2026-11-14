import React from 'react';

const EmployeeTable = ({
  employees,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
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

  const getStaffTypeBadge = (staffType) => {
    if (staffType === 'Administrative') {
      return <span className="badge badge-admin">Administrative</span>;
    }
    return <span className="badge badge-field">Field Staff</span>;
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

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Designation & Type</th>
            <th>Department</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Field Ready</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: emp.staffType === 'Administrative' ? '#e0e7ff' : '#dcfce7',
                      color: emp.staffType === 'Administrative' ? '#4338ca' : '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(emp.fullName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                      {emp.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
                      {emp.employeeId}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{emp.designation}</div>
                <div style={{ marginTop: '2px' }}>{getStaffTypeBadge(emp.staffType)}</div>
              </td>
              <td>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {emp.department || '—'}
                </span>
              </td>
              <td>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-800)' }}>{emp.phone}</div>
                {emp.email && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{emp.email}</div>
                )}
              </td>
              <td>{getStatusBadge(emp.employmentStatus)}</td>
              <td>
                {emp.isFieldOfficer ? (
                  <span
                    title="Available for Member 1 Field Officer Assignments"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      color: '#059669',
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>✓</span> Field Eligible
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Office Only</span>
                )}
              </td>
              <td>
                <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onView(emp)}
                    title="View Full Profile"
                  >
                    👁️ View
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(emp)}
                    title="Edit Profile"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onChangeStatus(emp)}
                    title="Update Employment Status"
                  >
                    🔄 Status
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(emp)}
                    title="Delete Staff"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
