import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, role, logout } = useAuth();

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'admin':
        return { background: '#6d28d9', color: '#ffffff' };
      case 'manager':
        return { background: '#0284c7', color: '#ffffff' };
      case 'accountant':
        return { background: '#d97706', color: '#ffffff' };
      case 'field_officer':
        return { background: '#16a34a', color: '#ffffff' };
      default:
        return { background: '#475569', color: '#ffffff' };
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>NGO System</h2>
        <span>SE331 • Group 04 (C2)</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview</div>
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '16px', color: '#38bdf8' }}>
          Member 3 Tasks (Active)
        </div>
        <NavLink
          to="/employees"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span>Employee Management</span>
        </NavLink>
        <NavLink
          to="/installments"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">💳</span>
          <span>Installment Management</span>
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📑</span>
          <span>Transaction Management</span>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🛡️</span>
          <span>User & Role Management</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Member 1 Tasks
        </div>
        <NavLink
          to="/members"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">👥</span>
          <span>Member Management</span>
        </NavLink>
        <NavLink
          to="/field-officers"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📋</span>
          <span>Officer Assignments</span>
        </NavLink>
        <NavLink
          to="/savings"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">💰</span>
          <span>Savings Management</span>
        </NavLink>
        <NavLink
          to="/receipts"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🧾</span>
          <span>Receipt Generation</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Member 2 Tasks
        </div>
        <NavLink
          to="/verification"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🚪</span>
          <span>Member Verification</span>
        </NavLink>
        <NavLink
          to="/loans"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">💵</span>
          <span>Loan Management</span>
        </NavLink>
        <NavLink
          to="/due-overdue"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">⚠️</span>
          <span>Due & Overdue</span>
        </NavLink>
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #334155',
        fontSize: '0.8125rem',
        color: '#cbd5e1',
        background: '#0f172a',
      }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <span style={{
                ...getRoleBadgeStyle(role),
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                {role?.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px' }}>
              {user.email}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login" style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none' }}>
                Switch Account
              </NavLink>
              <span style={{ color: '#64748b' }}>•</span>
              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  padding: 0,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '8px', color: '#94a3b8' }}>Not signed in</div>
            <NavLink to="/login" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
              Sign In
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
