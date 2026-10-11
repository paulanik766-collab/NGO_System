import React from 'react';

const AssignmentTable = ({
  assignments,
  onEdit,
  onRemove,
  isLoading,
}) => {
  if (isLoading) return null;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Field Officer</th>
            <th>Assigned Member</th>
            <th>Collection Group</th>
            <th>Assignment Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment._id}>
              <td>
                <strong>{assignment.fieldOfficer?.fullName || 'Unknown Officer'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: {assignment.fieldOfficer?.employeeId || 'N/A'} |{' '}
                  {assignment.fieldOfficer?.phone || 'No Phone'}
                </div>
              </td>
              <td>
                {assignment.member ? (
                  <div>
                    <span>{assignment.member.fullName}</span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: {assignment.member.memberId}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>— None —</span>
                )}
              </td>
              <td>
                {assignment.collectionGroup ? (
                  <span className="badge badge-primary">{assignment.collectionGroup}</span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>— None —</span>
                )}
              </td>
              <td>{new Date(assignment.assignmentDate).toLocaleDateString()}</td>
              <td>
                <span
                  className={`badge ${
                    assignment.status === 'Active' ? 'badge-active' : 'badge-removed'
                  }`}
                >
                  {assignment.status}
                </span>
              </td>
              <td>
                <span title={assignment.notes} style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {assignment.notes
                    ? assignment.notes.length > 20
                      ? `${assignment.notes.substring(0, 20)}...`
                      : assignment.notes
                    : '—'}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Edit Assignment"
                    onClick={() => onEdit(assignment)}
                  >
                    Edit
                  </button>
                  {assignment.status === 'Active' && (
                    <button
                      className="btn btn-danger btn-sm"
                      title="Remove Assignment"
                      onClick={() => onRemove(assignment._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
