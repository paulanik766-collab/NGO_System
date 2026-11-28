import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'field_officer',
    phone: '',
    branch: 'Mirpur Branch',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please enter name, email, and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data?.success) {
        onUserCreated();
        onClose();
      } else {
        setErrorMsg(res.data?.message || 'Failed to create user');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div className="modal-content" style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Add New Staff Account
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Anik Paul"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Work Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. anik@ngo.org"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Password *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Assigned RBAC Role *</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Admin / Executive Director</option>
              <option value="manager">Branch Manager</option>
              <option value="accountant">Accountant</option>
              <option value="field_officer">Field Officer</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Phone</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="017xxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Branch</label>
              <input
                type="text"
                name="branch"
                className="form-control"
                placeholder="Mirpur Branch"
                value={formData.branch}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
