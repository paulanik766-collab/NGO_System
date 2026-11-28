import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateUserModal from '../components/users/CreateUserModal';

const UsersPage = () => {
  const { user: currentUser, switchRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedRole) params.role = selectedRole;

      const res = await authAPI.getUsers(params);
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch {
      setUsers([
        {
          _id: '1',
          name: 'Jahurul Islam Prottoy',
          email: 'admin@ngo.org',
          role: 'admin',
          phone: '01711223344',
          branch: 'Mirpur Head Office',
          isActive: true,
          createdAt: new Date(),
        },
        {
          _id: '2',
          name: 'Tasnimul Islam Ratul',
          email: 'manager@ngo.org',
          role: 'manager',
          phone: '01811223344',
          branch: 'Dhanmondi Branch',
          isActive: true,
          createdAt: new Date(),
        },
        {
          _id: '3',
          name: 'Accountant Staff',
          email: 'accountant@ngo.org',
          role: 'accountant',
          phone: '01911223344',
          branch: 'Mirpur Head Office',
          isActive: true,
          createdAt: new Date(),
        },
        {
          _id: '4',
          name: 'Anik Paul',
          email: 'field@ngo.org',
          role: 'field_officer',
          phone: '01611223344',
          branch: 'Mirpur Branch',
          isActive: true,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await authAPI.updateRole(userId, newRole);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: `Role updated to ${newRole.toUpperCase()}` });
        fetchUsers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update role' });
    }
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await authAPI.toggleStatus(userId);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: res.data.message });
        fetchUsers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to toggle status' });
    }
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 600 }}>👑 Admin</span>;
      case 'manager':
        return <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>🏢 Manager</span>;
      case 'accountant':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>💼 Accountant</span>;
      case 'field_officer':
        return <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>🏃 Field Officer</span>;
      default:
        return <span className="badge badge-secondary">{role}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.75rem' }}>🛡️</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              User Authentication & Role Management
            </h1>
          </div>
          <p style={{ color: '#64748b', margin: 0 }}>
            Member 3 (Module 3) • Secure JWT authentication and Role-Based Access Control (RBAC)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Staff User
          </button>
        </div>
      </div>

      {alertMsg && (
        <div style={{
          background: alertMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${alertMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: alertMsg.type === 'success' ? '#166534' : '#991b1b',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
        }}>
          {alertMsg.type === 'success' ? '✅' : '⚠️'} {alertMsg.text}
        </div>
      )}

      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
          SE331 Role-Based Access Control (RBAC) Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#6d28d9', marginBottom: '4px' }}>👑 Admin / Executive Director</div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              System-wide financial oversight, role administration, user activation, audit logs, and master configurations.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>🏢 Branch Manager</div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              Approves member enrollments, verifies loan applications, assigns field officers, and inspects overdue defaulters.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>💼 Accountant</div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              Central unified transaction ledger, savings account reconciliations, financial reports, and disbursement records.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>🏃 Field Officer</div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              Field visits, collecting installment and savings payments, issuing money receipts, and updating member profiles.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>Switch Active Persona for Testing:</span>
          {['admin', 'manager', 'accountant', 'field_officer'].map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-sm ${currentUser?.role === r ? 'btn-primary' : 'btn-outline-primary'}`}
              style={{ textTransform: 'capitalize' }}
              onClick={() => {
                switchRole(r);
                setAlertMsg({ type: 'success', text: `Switched active testing role to ${r.toUpperCase()}` });
                setTimeout(() => setAlertMsg(null), 2500);
              }}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '500px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchUsers}
            >
              Search
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Filter by Role:</label>
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Branch Manager</option>
              <option value="accountant">Accountant</option>
              <option value="field_officer">Field Officer</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading users...</div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.8125rem' }}>
                  <th style={{ padding: '12px 16px' }}>USER</th>
                  <th style={{ padding: '12px 16px' }}>ROLE</th>
                  <th style={{ padding: '12px 16px' }}>BRANCH & PHONE</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px' }}>CHANGE ROLE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getRoleBadge(u.role)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#334155' }}>{u.branch || 'Head Office'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`} style={{
                        background: u.isActive ? '#dcfce7' : '#fee2e2',
                        color: u.isActive ? '#15803d' : '#991b1b',
                      }}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        className="form-control form-control-sm"
                        style={{ width: '140px', fontSize: '0.8125rem' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="accountant">Accountant</option>
                        <option value="field_officer">Field Officer</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default UsersPage;
