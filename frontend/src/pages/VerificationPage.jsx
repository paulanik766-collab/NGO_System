import React, { useState, useEffect } from 'react';
import { verificationAPI, memberAPI } from '../services/api';
import VerificationTable from '../components/verification/VerificationTable';
import DocumentUploadForm from '../components/verification/DocumentUploadForm';
import VerificationDetail from '../components/verification/VerificationDetail';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const VerificationPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingVerification, setViewingVerification] = useState(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await verificationAPI.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        documentType: typeFilter || undefined,
      });
      setVerifications(res.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch verification records.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVerifications();
  };

  const handleUploadDocument = async (formData) => {
    setIsSubmitting(true);
    try {
      await verificationAPI.upload(formData);
      setAlert({ type: 'success', message: 'Document uploaded successfully!' });
      setShowUploadModal(false);
      fetchVerifications();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to upload document.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status, remarks = '') => {
    try {
      const res = await verificationAPI.updateStatus(id, { status, remarks });
      setAlert({ type: 'success', message: res.data.message });
      if (viewingVerification && viewingVerification._id === id) {
        setViewingVerification(res.data.data);
      }
      fetchVerifications();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update verification status.',
      });
    }
  };

  const handleDeleteVerification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this verification record and its document?')) return;
    try {
      await verificationAPI.delete(id);
      setAlert({ type: 'success', message: 'Verification record deleted successfully.' });
      if (viewingVerification && viewingVerification._id === id) {
        setViewingVerification(null);
      }
      fetchVerifications();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete verification record.',
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Member Verification</h1>
          <p>Upload, review, and manage member verification documents (NID & Photos)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          + Upload Document
        </button>
      </div>

      <div className="page-content">
        <Alert
          type={alert?.type}
          message={alert?.message}
          onClose={() => setAlert(null)}
        />

        <div className="card mb-4">
          <div className="card-body">
            <div className="toolbar">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by member name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Search
                </button>
                {search && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearch('');
                      setTimeout(fetchVerifications, 0);
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>

              <select
                className="form-control"
                style={{ width: '160px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                className="form-control"
                style={{ width: '160px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="NID">NID</option>
                <option value="Photo">Photo</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Verification Documents ({verifications.length})</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading verification records..." />
            ) : verifications.length === 0 ? (
              <EmptyState
                icon="🪪"
                title="No verification records found"
                description={
                  search || statusFilter || typeFilter
                    ? 'No records match the selected filters.'
                    : 'Click "Upload Document" to submit a member\'s verification document.'
                }
              />
            ) : (
              <VerificationTable
                verifications={verifications}
                onView={(v) => setViewingVerification(v)}
                onVerify={(id) => handleUpdateStatus(id, 'Verified')}
                onReject={(id, remarks) => handleUpdateStatus(id, 'Rejected', remarks)}
                onDelete={handleDeleteVerification}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal: Upload Document */}
      <Modal
        isOpen={showUploadModal}
        title="Upload Verification Document"
        onClose={() => setShowUploadModal(false)}
      >
        <DocumentUploadForm
          onSubmit={handleUploadDocument}
          onCancel={() => setShowUploadModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: View Verification Details */}
      <Modal
        isOpen={Boolean(viewingVerification)}
        title={`Verification: ${viewingVerification?.member?.fullName || ''}`}
        onClose={() => setViewingVerification(null)}
      >
        <VerificationDetail
          verification={viewingVerification}
          onVerify={(id) => handleUpdateStatus(id, 'Verified')}
          onReject={(id, remarks) => handleUpdateStatus(id, 'Rejected', remarks)}
          onDelete={handleDeleteVerification}
          onClose={() => setViewingVerification(null)}
        />
      </Modal>
    </div>
  );
};

export default VerificationPage;
