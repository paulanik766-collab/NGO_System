import React, { useState, useEffect } from 'react';

const AssignmentForm = ({
  initialData,
  officers,
  members,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    fieldOfficer: '',
    member: '',
    collectionGroup: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fieldOfficer: initialData.fieldOfficer?._id || initialData.fieldOfficer || '',
        member: initialData.member?._id || initialData.member || '',
        collectionGroup: initialData.collectionGroup || '',
        assignmentDate: initialData.assignmentDate
          ? new Date(initialData.assignmentDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fieldOfficer) {
      newErrors.fieldOfficer = 'Please select a Field Officer';
    }
    if (!formData.member && !formData.collectionGroup.trim()) {
      newErrors.target = 'You must assign either a Member or specify a Collection Group';
    }
    if (!formData.assignmentDate) {
      newErrors.assignmentDate = 'Assignment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.target) {
      setErrors((prev) => ({ ...prev, [name]: undefined, target: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">
          Select Field Officer <span className="required">*</span>
        </label>
        <select
          name="fieldOfficer"
          className={`form-control ${errors.fieldOfficer ? 'error' : ''}`}
          value={formData.fieldOfficer}
          onChange={handleChange}
          disabled={isLoading || Boolean(initialData)}
        >
          <option value="">-- Choose Field Officer --</option>
          {officers.map((officer) => (
            <option key={officer._id} value={officer._id}>
              {officer.fullName} ({officer.employeeId}) - {officer.designation || 'Field Officer'}
            </option>
          ))}
        </select>
        {errors.fieldOfficer && <div className="form-error">{errors.fieldOfficer}</div>}
      </div>

      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
          ASSIGNMENT TARGET (Select Member, specify Collection Group, or both)
        </p>
        
        <div className="form-group">
          <label className="form-label">Assign to Specific Member</label>
          <select
            name="member"
            className="form-control"
            value={formData.member}
            onChange={handleChange}
            disabled={isLoading || Boolean(initialData)}
          >
            <option value="">-- None / Select Member --</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.fullName} ({member.memberId}) - Status: {member.status}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Or Collection Group Name</label>
          <input
            type="text"
            name="collectionGroup"
            className="form-control"
            placeholder="e.g. Group Alpha, North Zone Unit 1"
            value={formData.collectionGroup}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {errors.target && (
          <div className="form-error" style={{ marginTop: '8px' }}>
            {errors.target}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          Assignment Date <span className="required">*</span>
        </label>
        <input
          type="date"
          name="assignmentDate"
          className={`form-control ${errors.assignmentDate ? 'error' : ''}`}
          value={formData.assignmentDate}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.assignmentDate && <div className="form-error">{errors.assignmentDate}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Notes / Instructions</label>
        <textarea
          name="notes"
          rows="2"
          className="form-control"
          placeholder="e.g. Weekly microfinance installment collection"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
        ></textarea>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
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
          {isLoading ? 'Saving...' : initialData ? 'Update Assignment' : 'Assign Officer'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
