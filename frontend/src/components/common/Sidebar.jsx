import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
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

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Member 3 Tasks (Active)
        </div>
        <NavLink
          to="/employees"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">👔</span>
          <span>Employee Management</span>
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

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Member 2 Tasks
        </div>
        <NavLink
          to="/verification"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🪪</span>
          <span>Member Verification</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Team Workspaces (Stubs)
        </div>
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #334155', fontSize: '0.75rem', color: '#94a3b8' }}>
        <strong>Member 3 Workspace</strong>
        <div>DIU Software Engineering (SE331)</div>
      </div>
    </aside>
  );
};

export default Sidebar;
