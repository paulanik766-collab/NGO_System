import React, { useState, useEffect } from 'react';

const COMMON_DESIGNATIONS = {
  Administrative: [
    'Executive Director',
    'Program Manager',
    'Finance Officer',
    'Accountant',
    'Human Resources Officer',
    'Administrative Officer',
    'IT Support Specialist',
    'Logistics Coordinator',
    'Monitoring & Evaluation Officer',
  ],
  'Field Staff': [
    'Field Officer',
    'Field Supervisor',
    'Community Mobilizer',
    'Health Worker',
    'Relief Coordinator',
    'Field Data Collector',
  ],
};

const COMMON_DEPARTMENTS = [
  'Administration',
  'Field Operations',
  'Finance & Accounts',
  'Human Resources',
  'Program Management',
  'Health & Community Services',
  'Logistics & Supply',
];

const EmployeeForm = ({ initialData = null, onSubmit, onCancel, isSubmitting }) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    staffType: 'Administrative',
    designation: 'Administrative Officer',
    department: 'Administration',
    employmentStatus: 'Active',
    isFieldOfficer: false,
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    nidNumber: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
    },
    bloodGroup: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        staffType: initialData.staffType || 'Administrative',
        designation: initialData.designation || 'Administrative Officer',
        department: initialData.department || 'Administration',
        employmentStatus: initialData.employmentStatus || 'Active',
        isFieldOfficer: initialData.isFieldOfficer ?? false,
        joiningDate: initialData.joiningDate
          ? new Date(initialData.joiningDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        salary: initialData.salary ?? '',
        nidNumber: initialData.nidNumber || '',
        address: initialData.address || '',
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          phone: initialData.emergencyContact?.phone || '',
          relation: initialData.emergencyContact?.relation || '',
        },
        bloodGroup: initialData.bloodGroup || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.designation.trim()) errs.designation = 'Designation is required';
    if (!formData.department.trim()) errs.department = 'Department is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (formData.salary && Number(formData.salary) < 0) {
      errs.salary = 'Salary cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
      return;
    }

    if (name === 'staffType') {
      const isField = value === 'Field Staff';
      setFormData((prev) => ({
        ...prev,
        staffType: value,
        department: isField ? 'Field Operations' : prev.department === 'Field Operations' ? 'Administration' : prev.department,
        designation: isField ? 'Field Officer' : 'Administrative Officer',
        isFieldOfficer: isField,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      employeeId: formData.employeeId.trim().toUpperCase(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim(),
      salary: formData.salary !== '' ? Number(formData.salary) : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ─── 1. Staff Classification & Identity ─── */}
      <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--gray-200)' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '12px' }}>
          Staff Classification & Profile
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Staff Type <span className="required">*</span>
            </label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Administrative">Administrative Staff (Office/Management)</option>
              <option value="Field Staff">Field Staff (Field Officer/Operations)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Employee ID <span className="required">*</span>
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder={formData.staffType === 'Field Staff' ? 'e.g. FO-001' : 'e.g. ADM-001'}
              className={`form-control ${errors.employeeId ? 'error' : ''}`}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.employeeId && <div className="form-error">{errors.employeeId}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Md. Tariqul Islam"
            className={`form-control ${errors.fullName ? 'error' : ''}`}
          />
          {errors.fullName && <div className="form-error">{errors.fullName}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Designation <span className="required">*</span>
            </label>
            <input
              type="text"
              name="designation"
              list="designationSuggestions"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Field Officer, Finance Officer"
              className={`form-control ${errors.designation ? 'error' : ''}`}
            />
            <datalist id="designationSuggestions">
              {(COMMON_DESIGNATIONS[formData.staffType] || []).map((des) => (
                <option key={des} value={des} />
              ))}
            </datalist>
            {errors.designation && <div className="form-error">{errors.designation}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Department <span className="required">*</span>
            </label>
            <input
              type="text"
              name="department"
              list="departmentSuggestions"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Field Operations, Administration"
              className={`form-control ${errors.department ? 'error' : ''}`}
            />
            <datalist id="departmentSuggestions">
              {COMMON_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
            {errors.department && <div className="form-error">{errors.department}</div>}
          </div>
        </div>
      </div>

      {/* ─── 2. Contact & Address Information ─── */}
      <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--gray-200)' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '12px' }}>
          Contact Information
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+8801XXXXXXXXX"
              className={`form-control ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="staff@ngo.org"
              className={`form-control ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Residential Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House/Road, Thana, District"
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              placeholder="Relative / Contact person"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Emergency Contact Phone</label>
            <input
              type="text"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              placeholder="+8801XXXXXXXXX"
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* ─── 3. Employment & Field Settings ─── */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '12px' }}>
          Employment Status & Details
        </h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Employment Status <span className="required">*</span>
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Monthly Salary (BDT)</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 35000"
              className={`form-control ${errors.salary ? 'error' : ''}`}
            />
            {errors.salary && <div className="form-error">{errors.salary}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">National ID (NID)</label>
            <input
              type="text"
              name="nidNumber"
              value={formData.nidNumber}
              onChange={handleChange}
              placeholder="NID 10/13/17 digits"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                name="isFieldOfficer"
                checked={formData.isFieldOfficer}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <span>
                <strong>Eligible for Field Officer Assignments</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  (Enables assignment in Member 1 Field Tracking module)
                </div>
              </span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Administrative Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Special skills, project responsibilities, or background remarks..."
            className="form-control"
            rows="2"
          />
        </div>
      </div>

      {/* ─── Actions ─── */}
      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Register Employee'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
