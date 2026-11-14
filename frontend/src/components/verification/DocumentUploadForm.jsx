import React, { useState, useEffect } from 'react';
import { memberAPI } from '../../services/api';

const DocumentUploadForm = ({ onSubmit, onCancel, isLoading }) => {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState('');
  const [documentType, setDocumentType] = useState('NID');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch members for the dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.getAll({ limit: 200 });
        setMembers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Generate file preview
  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  const validate = () => {
    const newErrors = {};
    if (!selectedMember) newErrors.member = 'Please select a member.';
    if (!documentType) newErrors.documentType = 'Please select a document type.';
    if (!file) {
      newErrors.file = 'Please select a file to upload.';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        newErrors.file = 'Invalid file type. Allowed: JPEG, PNG, PDF.';
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.file = 'File is too large. Maximum size: 5 MB.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('member', selectedMember);
    formData.append('documentType', documentType);
    formData.append('document', file);

    onSubmit(formData);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Member Selection */}
      <div className="form-group">
        <label className="form-label">
          Member <span style={{ color: '#ef4444' }}>*</span>
        </label>
        {membersLoading ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading members...</p>
        ) : (
          <select
            className={`form-control ${errors.member ? 'is-invalid' : ''}`}
            value={selectedMember}
            onChange={(e) => {
              setSelectedMember(e.target.value);
              setErrors((prev) => ({ ...prev, member: undefined }));
            }}
          >
            <option value="">— Select a member —</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.memberId} — {m.fullName}
              </option>
            ))}
          </select>
        )}
        {errors.member && <div className="form-error">{errors.member}</div>}
      </div>

      {/* Document Type */}
      <div className="form-group">
        <label className="form-label">
          Document Type <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          className={`form-control ${errors.documentType ? 'is-invalid' : ''}`}
          value={documentType}
          onChange={(e) => {
            setDocumentType(e.target.value);
            setErrors((prev) => ({ ...prev, documentType: undefined }));
          }}
        >
          <option value="NID">NID (National ID)</option>
          <option value="Photo">Photo</option>
          <option value="Other">Other</option>
        </select>
        {errors.documentType && <div className="form-error">{errors.documentType}</div>}
      </div>

      {/* File Upload */}
      <div className="form-group">
        <label className="form-label">
          Document File <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div
          className="file-input-zone"
          onClick={() => document.getElementById('verification-file-input').click()}
        >
          <input
            id="verification-file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {file ? (
            <div style={{ textAlign: 'center' }}>
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="document-preview"
                />
              ) : (
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
              )}
              <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{file.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {formatFileSize(file.size)} • {file.type}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginTop: '4px' }}>
                Click to change file
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
              <div style={{ fontWeight: 600 }}>Click to select a file</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Accepted: JPEG, PNG, PDF • Max 5 MB
              </div>
            </div>
          )}
        </div>
        {errors.file && <div className="form-error">{errors.file}</div>}
      </div>

      {/* Buttons */}
      <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
