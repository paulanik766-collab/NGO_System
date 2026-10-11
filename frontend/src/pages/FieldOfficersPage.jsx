import React, { useState, useEffect } from 'react';
import { assignmentAPI, memberAPI } from '../services/api';
import AssignmentTable from '../components/fieldOfficers/AssignmentTable';
import AssignmentForm from '../components/fieldOfficers/AssignmentForm';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const FieldOfficersPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsRes, officersRes, membersRes] = await Promise.all([
        assignmentAPI.getAll({
          fieldOfficer: selectedOfficer || undefined,
          member: selectedMember || undefined,
          collectionGroup: groupFilter.trim() || undefined,
          status: statusFilter || undefined,
        }),
        assignmentAPI.getFieldOfficers(),
        memberAPI.getAll({ limit: 100 }),
      ]);

      setAssignments(assignmentsRes.data.data || []);
      setOfficers(officersRes.data.data || []);
      setMembers(membersRes.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch assignment data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOfficer, selectedMember, statusFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateAssignment = async (formData) => {
    setIsSubmitting(true);
    try {
      await assignmentAPI.create(formData);
      setAlert({ type: 'success', message: 'Field officer assigned successfully!' });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create assignment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAssignment = async (formData) => {
    if (!editingAssignment) return;
    setIsSubmitting(true);
    try {
      await assignmentAPI.update(editingAssignment._id, formData);
      setAlert({ type: 'success', message: 'Assignment updated successfully!' });
      setEditingAssignment(null);
      fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update assignment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await assignmentAPI.remove(id);
      setAlert({ type: 'success', message: 'Assignment removed successfully.' });
      fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove assignment.',
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Field Officer Assignments</h1>
          <p>
            Connect field officers (Employees) with NGO members and collection groups for field tracking
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Assignment
        </button>
      </div>

      <div className="page-content">
        <Alert
          type={alert?.type}
          message={alert?.message}
          onClose={() => setAlert(null)}
        />

        {/* Quick Officer Overview Card */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Field Officers Directory ({officers.length})</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              From Employee Model (Member 3 Scaffold)
            </span>
          </div>
          <div className="card-body">
            {officers.length === 0 ? (
              <p className="text-muted">No field officers currently registered in the database.</p>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {officers.map((off) => {
                  const assignedCount = assignments.filter(
                    (a) => a.fieldOfficer?._id === off._id && a.status === 'Active'
                  ).length;
                  return (
                    <div
                      key={off._id}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        borderColor: selectedOfficer === off._id ? '#2563eb' : '#e2e8f0',
                      }}
                      onClick={() =>
                        setSelectedOfficer((prev) => (prev === off._id ? '' : off._id))
                      }
                    >
                      <strong style={{ fontSize: '0.9rem' }}>{off.fullName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ID: {off.employeeId} | {off.designation || 'Field Officer'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="badge badge-primary">
                          {assignedCount} Active Assignment{assignedCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filtering Toolbar */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleFilterSubmit}>
              <div className="toolbar" style={{ margin: 0 }}>
                <select
                  className="form-control"
                  style={{ width: '200px' }}
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                >
                  <option value="">All Field Officers</option>
                  {officers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.fullName} ({off.employeeId})
                    </option>
                  ))}
                </select>

                <select
                  className="form-control"
                  style={{ width: '200px' }}
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">All Members</option>
                  {members.map((mem) => (
                    <option key={mem._id} value={mem._id}>
                      {mem.fullName} ({mem.memberId})
                    </option>
                  ))}
                </select>

                <div className="search-box" style={{ maxWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Collection Group..."
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                  />
                </div>

                <select
                  className="form-control"
                  style={{ width: '150px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Removed">Removed Only</option>
                </select>

                <button type="submit" className="btn btn-secondary">
                  Filter
                </button>

                {(selectedOfficer || selectedMember || groupFilter || statusFilter) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedOfficer('');
                      setSelectedMember('');
                      setGroupFilter('');
                      setStatusFilter('');
                      setTimeout(fetchData, 0);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Assignments Table Card */}
        <div className="card">
          <div className="card-header">
            <h3>Field Officer Assignments ({assignments.length})</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading assignments..." />
            ) : assignments.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No assignments found"
                description={
                  selectedOfficer || selectedMember || groupFilter || statusFilter
                    ? 'No assignments match the selected filter criteria.'
                    : 'Click "New Assignment" to assign a field officer to a member or collection group.'
                }
              />
            ) : (
              <AssignmentTable
                assignments={assignments}
                onEdit={(a) => setEditingAssignment(a)}
                onRemove={handleRemoveAssignment}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Assignment */}
      <Modal
        isOpen={showCreateModal}
        title="Create Field Officer Assignment"
        onClose={() => setShowCreateModal(false)}
      >
        <AssignmentForm
          officers={officers}
          members={members}
          onSubmit={handleCreateAssignment}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: Edit Assignment */}
      <Modal
        isOpen={Boolean(editingAssignment)}
        title="Edit Assignment"
        onClose={() => setEditingAssignment(null)}
      >
        <AssignmentForm
          initialData={editingAssignment}
          officers={officers}
          members={members}
          onSubmit={handleUpdateAssignment}
          onCancel={() => setEditingAssignment(null)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default FieldOfficersPage;
