import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetail from '../components/employees/EmployeeDetail';
import EmployeeStatusModal from '../components/employees/EmployeeStatusModal';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    administrative: 0,
    fieldStaff: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    probation: 0,
    departments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewingAssignmentsCount, setViewingAssignmentsCount] = useState(0);
  const [statusModalEmployee, setStatusModalEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        employeeAPI.getAll({
          search: search.trim() || undefined,
          staffType: staffTypeFilter || undefined,
          employmentStatus: statusFilter || undefined,
          department: departmentFilter || undefined,
          limit: 100,
        }),
        employeeAPI.getStats(),
      ]);

      setEmployees(listRes.data.data || []);
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch employees.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [staffTypeFilter, statusFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStaffTypeFilter('');
    setStatusFilter('');
    setDepartmentFilter('');
    setTimeout(fetchEmployees, 0);
  };

  const handleCreateEmployee = async (formData) => {
    setIsSubmitting(true);
    try {
      await employeeAPI.create(formData);
      setAlert({ type: 'success', message: 'Employee profile created successfully!' });
      setShowCreateModal(false);
      fetchEmployees();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create employee.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (formData) => {
    if (!editingEmployee) return;
    setIsSubmitting(true);
    try {
      await employeeAPI.update(editingEmployee._id, formData);
      setAlert({ type: 'success', message: 'Employee profile updated successfully!' });
      setEditingEmployee(null);
      if (viewingEmployee && viewingEmployee._id === editingEmployee._id) {
        setViewingEmployee(null);
      }
      fetchEmployees();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update employee.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!statusModalEmployee) return;
    setIsSubmitting(true);
    try {
      const res = await employeeAPI.updateStatus(statusModalEmployee._id, newStatus);
      setAlert({ type: 'success', message: res.data?.message || `Status updated to ${newStatus}` });
      setStatusModalEmployee(null);
      fetchEmployees();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update employment status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setIsSubmitting(true);
    try {
      const res = await employeeAPI.delete(deletingEmployee._id);
      setAlert({ type: 'success', message: res.data?.message || 'Employee deleted successfully!' });
      setDeletingEmployee(null);
      fetchEmployees();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete employee.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEmployee = async (emp) => {
    try {
      const res = await employeeAPI.getById(emp._id);
      setViewingEmployee(res.data?.data || emp);
      setViewingAssignmentsCount(res.data?.activeAssignmentsCount || 0);
    } catch (err) {
      setViewingEmployee(emp);
      setViewingAssignmentsCount(0);
    }
  };

  return (
    <div>
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Employee Management</h1>
          <p>SE331 Member 3 • Administrative & Field Staff Profiles, Designations, and Employment Statuses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Register New Employee
        </button>
      </div>

      <div className="page-content">
        {/* Module Scope Notice for SE331 Evaluator */}
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <span className="alert-icon">👔</span>
          <div>
            <strong>Member 3 Scope:</strong> Full CRUD operations for administrative and field staff profiles, managing designations, and employment statuses (Active, Inactive, On Leave, Probation, Terminated). Integrated with Member 1's Field Officer Assignment module.
          </div>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* ─── Top Statistics Cards ─────────────────────────────────── */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-value" style={{ color: '#6366f1' }}>{stats.administrative}</div>
            <div className="stat-label">Administrative Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌾</div>
            <div className="stat-value" style={{ color: '#059669' }}>{stats.fieldStaff}</div>
            <div className="stat-label">Field Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{stats.active}</div>
            <div className="stat-label">Active Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{stats.onLeave}</div>
            <div className="stat-label">On Leave</div>
          </div>
        </div>

        {/* ─── Filter & Search Toolbar ──────────────────────────────── */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <form onSubmit={handleSearchSubmit} className="toolbar" style={{ margin: 0 }}>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, ID, phone, email, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                />
              </div>

              <select
                value={staffTypeFilter}
                onChange={(e) => setStaffTypeFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '150px' }}
              >
                <option value="">All Staff Types</option>
                <option value="Administrative">Administrative</option>
                <option value="Field Staff">Field Staff</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Terminated">Terminated</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '160px' }}
              >
                <option value="">All Departments</option>
                {(stats.departments || []).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>

              {(search || staffTypeFilter || statusFilter || departmentFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ─── Employees Table / Content ────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>Staff Directory ({employees.length})</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              {staffTypeFilter ? `${staffTypeFilter} • ` : ''}
              {statusFilter ? `${statusFilter} • ` : ''}
              Showing {employees.length} records
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading employee directory..." />
            ) : employees.length === 0 ? (
              <EmptyState
                icon="👔"
                title="No employees found"
                description={
                  search || staffTypeFilter || statusFilter || departmentFilter
                    ? 'Try clearing or modifying your search and filter criteria.'
                    : 'Get started by registering administrative staff or field officers.'
                }
              />
            ) : (
              <EmployeeTable
                employees={employees}
                onView={handleViewEmployee}
                onEdit={(emp) => setEditingEmployee(emp)}
                onChangeStatus={(emp) => setStatusModalEmployee(emp)}
                onDelete={(emp) => setDeletingEmployee(emp)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Create Employee Modal ──────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        title="Register New Employee Profile"
        onClose={() => setShowCreateModal(false)}
      >
        <EmployeeForm
          onSubmit={handleCreateEmployee}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* ─── Edit Employee Modal ────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(editingEmployee)}
        title={`Edit Employee Profile — ${editingEmployee?.fullName || ''}`}
        onClose={() => setEditingEmployee(null)}
      >
        {editingEmployee && (
          <EmployeeForm
            initialData={editingEmployee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setEditingEmployee(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* ─── View Profile Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingEmployee)}
        title="Employee Profile Details"
        onClose={() => setViewingEmployee(null)}
      >
        {viewingEmployee && (
          <EmployeeDetail
            employee={viewingEmployee}
            activeAssignmentsCount={viewingAssignmentsCount}
            onEdit={(emp) => setEditingEmployee(emp)}
            onChangeStatus={(emp) => setStatusModalEmployee(emp)}
            onClose={() => setViewingEmployee(null)}
          />
        )}
      </Modal>

      {/* ─── Update Status Modal ────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(statusModalEmployee)}
        title="Update Employment Status"
        onClose={() => setStatusModalEmployee(null)}
      >
        {statusModalEmployee && (
          <EmployeeStatusModal
            employee={statusModalEmployee}
            onUpdateStatus={handleUpdateStatus}
            onCancel={() => setStatusModalEmployee(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* ─── Delete Confirmation Modal ──────────────────────────────── */}
      <Modal
        isOpen={Boolean(deletingEmployee)}
        title="Confirm Employee Deletion"
        onClose={() => setDeletingEmployee(null)}
      >
        {deletingEmployee && (
          <div>
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <span className="alert-icon">⚠️</span>
              <div>
                Are you sure you want to delete staff profile for{' '}
                <strong>{deletingEmployee.fullName}</strong> ({deletingEmployee.employeeId})? This action cannot be undone.
              </div>
            </div>
            {deletingEmployee.isFieldOfficer && (
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '16px' }}>
                <em>Note: If this employee is actively assigned as a field officer to members or collection groups, deletion will be blocked to maintain referential integrity.</em>
              </p>
            )}
            <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingEmployee(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteEmployee}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeesPage;
