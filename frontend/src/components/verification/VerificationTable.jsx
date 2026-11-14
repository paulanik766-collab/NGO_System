import React, { useState } from 'react';

const VerificationTable = ({ verifications, onView, onVerify, onReject, onDelete }) => {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const getStatusBadge = (status) => {
    const badgeClass = {
      Pending: 'badge-pending',
      Verified: 'badge-verified',
      Rejected: 'badge-rejected',
    };
    return <span className={`badge ${badgeClass[status] || ''}`}>{status}</span>;
  };

  const getDocTypeIcon = (type) => {
    const icons = { NID: '🪪', Photo: '📷', Other: '📄' };
    return icons[type] || '📄';
  };

  const handleRejectSubmit = (id) => {
    onReject(id, rejectRemarks);
    setRejectingId(null);
    setRejectRemarks('');
  };

  const handleRejectCancel = () => {
    setRejectingId(null);
    setRejectRemarks('');
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Member ID</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((v) => (
            <tr key={v._id}>
              <td style={{ fontWeight: 600 }}>
                {v.member?.fullName || 'Unknown Member'}
              </td>
              <td>
                <code style={{ fontSize: '0.85rem' }}>{v.member?.memberId || '—'}</code>
              </td>
              <td>
                <span>{getDocTypeIcon(v.documentType)} {v.documentType}</span>
              </td>
              <td>{getStatusBadge(v.verificationStatus)}</td>
              <td>{new Date(v.submittedAt || v.createdAt).toLocaleDateString()}</td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => onView(v)}
                  >
                    View
                  </button>

                  {v.verificationStatus === 'Pending' && (
                    <>
                      <button
                        className="btn btn-success"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => onVerify(v._id)}
                      >
                        ✓ Verify
                      </button>
                      <button
                        className="btn btn-warning"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => setRejectingId(v._id)}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => onDelete(v._id)}
                  >
                    Delete
                  </button>
                </div>

                {/* Inline reject form */}
                {rejectingId === v._id && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '4px 8px', flex: 1 }}
                      placeholder="Rejection reason (optional)..."
                      value={rejectRemarks}
                      onChange={(e) => setRejectRemarks(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="btn btn-warning"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={() => handleRejectSubmit(v._id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={handleRejectCancel}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationTable;
