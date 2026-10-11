import React from 'react';

const MemberDetail = ({ member, onEdit, onToggleStatus, onClose }) => {
  if (!member) return null;

  return (
    <div>
      <div className="detail-grid mb-4">
        <div className="detail-item">
          <label>Member ID</label>
          <p>{member.memberId}</p>
        </div>
        <div className="detail-item">
          <label>Full Name</label>
          <p>{member.fullName}</p>
        </div>
        <div className="detail-item">
          <label>Phone Number</label>
          <p>{member.phone}</p>
        </div>
        <div className="detail-item">
          <label>Email Address</label>
          <p>{member.email || 'N/A'}</p>
        </div>
        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
          <label>Address</label>
          <p>{member.address}</p>
        </div>
        <div className="detail-item">
          <label>Join Date</label>
          <p>{new Date(member.joinDate).toLocaleDateString()}</p>
        </div>
        <div className="detail-item">
          <label>Current Status</label>
          <p>
            <span
              className={`badge ${
                member.status === 'Active' ? 'badge-active' : 'badge-inactive'
              }`}
            >
              {member.status}
            </span>
          </p>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button
          className={`btn ${
            member.status === 'Active' ? 'btn-warning' : 'btn-success'
          }`}
          onClick={() => onToggleStatus(member._id)}
        >
          {member.status === 'Active' ? 'Deactivate Member' : 'Activate Member'}
        </button>
        <button className="btn btn-primary" onClick={() => onEdit(member)}>
          Edit Details
        </button>
      </div>
    </div>
  );
};

export default MemberDetail;
