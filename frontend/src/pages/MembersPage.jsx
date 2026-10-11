import React, { useState, useEffect } from 'react';
import { memberAPI } from '../services/api';
import MemberTable from '../components/members/MemberTable';
import MemberForm from '../components/members/MemberForm';
import MemberDetail from '../components/members/MemberDetail';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await memberAPI.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setMembers(res.data.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch members.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCreateMember = async (formData) => {
    setIsSubmitting(true);
    try {
      await memberAPI.create(formData);
      setAlert({ type: 'success', message: 'Member registered successfully!' });
      setShowCreateModal(false);
      fetchMembers();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to register member.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (formData) => {
    if (!editingMember) return;
    setIsSubmitting(true);
    try {
      await memberAPI.update(editingMember._id, formData);
      setAlert({ type: 'success', message: 'Member updated successfully!' });
      setEditingMember(null);
      if (viewingMember && viewingMember._id === editingMember._id) {
        setViewingMember(null);
      }
      fetchMembers();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update member.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await memberAPI.toggleStatus(id);
      setAlert({ type: 'success', message: res.data.message });
      if (viewingMember && viewingMember._id === id) {
        setViewingMember(res.data.data);
      }
      fetchMembers();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle status.',
      });
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await memberAPI.delete(id);
      setAlert({ type: 'success', message: 'Member deleted successfully.' });
      fetchMembers();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete member.',
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Member Management</h1>
          <p>Register, update, and manage all NGO member profiles and statuses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Register New Member
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
                    placeholder="Search by name, member ID, or phone..."
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
                      setTimeout(fetchMembers, 0);
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
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Registered Members ({members.length})</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading members..." />
            ) : members.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No members found"
                description={
                  search || statusFilter
                    ? 'No members match the selected filters.'
                    : 'Click "Register New Member" to add your first member.'
                }
              />
            ) : (
              <MemberTable
                members={members}
                onView={(m) => setViewingMember(m)}
                onEdit={(m) => setEditingMember(m)}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteMember}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal: Register New Member */}
      <Modal
        isOpen={showCreateModal}
        title="Register New NGO Member"
        onClose={() => setShowCreateModal(false)}
      >
        <MemberForm
          onSubmit={handleCreateMember}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: Edit Member */}
      <Modal
        isOpen={Boolean(editingMember)}
        title={`Edit Member: ${editingMember?.fullName || ''}`}
        onClose={() => setEditingMember(null)}
      >
        <MemberForm
          initialData={editingMember}
          onSubmit={handleUpdateMember}
          onCancel={() => setEditingMember(null)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal: View Member Details */}
      <Modal
        isOpen={Boolean(viewingMember)}
        title={`Member Profile: ${viewingMember?.fullName || ''}`}
        onClose={() => setViewingMember(null)}
      >
        <MemberDetail
          member={viewingMember}
          onEdit={(m) => {
            setViewingMember(null);
            setEditingMember(m);
          }}
          onToggleStatus={handleToggleStatus}
          onClose={() => setViewingMember(null)}
        />
      </Modal>
    </div>
  );
};

export default MembersPage;
