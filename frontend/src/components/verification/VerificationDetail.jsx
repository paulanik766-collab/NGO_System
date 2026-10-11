import React, { useState } from 'react';

const VerificationDetail = ({ verification, onVerify, onReject, onDelete, onClose }) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  if (!verification) return null;

  const isImage = verification.mimeType && verification.mimeType.startsWith('image/');
  const isPdf = verification.mimeType === 'application/pdf';

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusBadge = (status) => {
    const badgeClass = {
      Pending: 'badge-pending',
      Verified: 'badge-verified',
      Rejected: 'badge-rejected',
    };
    return <span className={`badge ${badgeClass[status] || ''}`}>{status}</span>;
  };

  const handleRejectSubmit = () => {
    onReject(verification._id, rejectRemarks);
    setShowRejectInput(false);
    setRejectRemarks('');
  };

  return (
    <div>
      {/* Document Preview */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {isImage ? (
          <img
            src={`/${verification.documentPath}`}
            alt={`${verification.documentType} document`}
            className="document-preview"
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
          />
        ) : isPdf ? (
          <div style={{ padding: '24px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
            <a
              href={`/${verification.documentPath}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'underline' }}
            >
              View PDF Document
            </a>
          </div>
        ) : (
          <div style={{ padding: '24px', background: '#1e293b', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem' }}>📎</div>
            <p style={{ color: '#94a3b8' }}>Document preview not available</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="detail-grid mb-4">
        <div className="detail-item">
          <label>Member Name</label>
          <p>{verification.member?.fullName || 'Unknown'}</p>
        </div>
        <div className="detail-item">
          <label>Member ID</label>
          <p>{verification.member?.memberId || '—'}</p>
        </div>
        <div className="detail-item">
          <label>Document Type</label>
          <p>{verification.documentType}</p>
        </div>
        <div className="detail-item">
          <label>Verification Status</label>
          <p>{getStatusBadge(verification.verificationStatus)}</p>
        </div>
        <div className="detail-item">
          <label>Original File Name</label>
          <p>{verification.originalFileName || '—'}</p>
        </div>
        <div className="detail-item">
          <label>File Size</label>
          <p>{formatFileSize(verification.fileSize)}</p>
        </div>
        <div className="detail-item">
          <label>File Type</label>
          <p>{verification.mimeType || '—'}</p>
        </div>
        <div className="detail-item">
          <label>Submitted</label>
          <p>
            {new Date(verification.submittedAt || verification.createdAt).toLocaleString()}
          </p>
        </div>

        {verification.reviewedAt && (
          <div className="detail-item">
            <label>Reviewed</label>
            <p>{new Date(verification.reviewedAt).toLocaleString()}</p>
          </div>
        )}

        {verification.remarks && (
          <div className="detail-item" style={{ gridColumn: 'span 2' }}>
            <label>Remarks</label>
            <p style={{ color: verification.verificationStatus === 'Rejected' ? '#f87171' : '#e2e8f0' }}>
              {verification.remarks}
            </p>
          </div>
        )}
      </div>

      {/* Inline Reject Remarks Input */}
      {showRejectInput && (
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Rejection Reason (optional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter reason for rejection..."
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-warning" onClick={handleRejectSubmit}>
              Confirm Rejection
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowRejectInput(false);
                setRejectRemarks('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>

        {verification.verificationStatus === 'Pending' && (
          <>
            <button
              className="btn btn-success"
              onClick={() => onVerify(verification._id)}
            >
              ✓ Mark Verified
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setShowRejectInput(true)}
            >
              ✗ Reject
            </button>
          </>
        )}

        <button
          className="btn btn-danger"
          onClick={() => onDelete(verification._id)}
        >
          Delete Record
        </button>
      </div>
    </div>
  );
};

export default VerificationDetail;
