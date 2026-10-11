import React, { useState, useEffect } from 'react';

const MemberForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        memberId: initialData.memberId || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        joinDate: initialData.joinDate
          ? new Date(initialData.joinDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.memberId.trim()) newErrors.memberId = 'Member ID is required';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.email && formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address format';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Member ID <span className="required">*</span>
          </label>
          <input
            type="text"
            name="memberId"
            className={`form-control ${errors.memberId ? 'error' : ''}`}
            placeholder="e.g. MEM-001"
            value={formData.memberId}
            onChange={handleChange}
            disabled={isLoading || Boolean(initialData)}
          />
          {errors.memberId && <div className="form-error">{errors.memberId}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`form-control ${errors.fullName ? 'error' : ''}`}
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.fullName && <div className="form-error">{errors.fullName}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="text"
            name="phone"
            className={`form-control ${errors.phone ? 'error' : ''}`}
            placeholder="e.g. +8801700000000"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email (Optional)</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email ? 'error' : ''}`}
            placeholder="e.g. member@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Address <span className="required">*</span>
        </label>
        <textarea
          name="address"
          rows="2"
          className={`form-control ${errors.address ? 'error' : ''}`}
          placeholder="e.g. House 12, Road 4, Sector 3, Uttara, Dhaka"
          value={formData.address}
          onChange={handleChange}
          disabled={isLoading}
        ></textarea>
        {errors.address && <div className="form-error">{errors.address}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Join Date <span className="required">*</span>
          </label>
          <input
            type="date"
            name="joinDate"
            className={`form-control ${errors.joinDate ? 'error' : ''}`}
            value={formData.joinDate}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.joinDate && <div className="form-error">{errors.joinDate}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0 0', marginTop: '16px' }}>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Member' : 'Register Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
