import React from 'react';

const MemberTable = ({
  members,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return null; // Parent will show LoadingSpinner
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Join Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member._id}>
              <td>
                <strong>{member.memberId}</strong>
              </td>
              <td>{member.fullName}</td>
              <td>{member.phone}</td>
              <td>
                <span title={member.address}>
                  {member.address.length > 25
                    ? `${member.address.substring(0, 25)}...`
                    : member.address}
                </span>
              </td>
              <td>{new Date(member.joinDate).toLocaleDateString()}</td>
              <td>
                <span
                  className={`badge ${
                    member.status === 'Active' ? 'badge-active' : 'badge-inactive'
                  }`}
                >
                  {member.status}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="View Profile"
                    onClick={() => onView(member)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Edit Member"
                    onClick={() => onEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    className={`btn btn-sm ${
                      member.status === 'Active' ? 'btn-warning' : 'btn-success'
                    }`}
                    title={member.status === 'Active' ? 'Deactivate' : 'Activate'}
                    onClick={() => onToggleStatus(member._id)}
                  >
                    {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Delete Member"
                    onClick={() => onDelete(member._id)}
                  >
                    Delete
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

export default MemberTable;
