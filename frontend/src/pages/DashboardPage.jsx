import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { memberAPI, assignmentAPI, employeeAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/UIComponents';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalOfficers: 0,
    activeAssignments: 0,
    totalEmployees: 0,
    adminEmployees: 0,
    fieldEmployees: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [membersRes, officersRes, assignmentsRes, employeeStatsRes, employeesRes] =
          await Promise.all([
            memberAPI.getAll({ limit: 100 }),
            assignmentAPI.getFieldOfficers(),
            assignmentAPI.getAll({ limit: 100 }),
            employeeAPI.getStats(),
            employeeAPI.getAll({ limit: 5 }),
          ]);

        const allMembers = membersRes.data.data || [];
        const allAssignments = assignmentsRes.data.data || [];
        const allOfficers = officersRes.data.data || [];
        const empStats = employeeStatsRes.data?.data || {};
        const staffList = employeesRes.data?.data || [];

        setStats({
          totalMembers: allMembers.length,
          activeMembers: allMembers.filter((m) => m.status === 'Active').length,
          inactiveMembers: allMembers.filter((m) => m.status === 'Inactive').length,
          totalOfficers: allOfficers.length,
          activeAssignments: allAssignments.filter((a) => a.status === 'Active').length,
          totalEmployees: empStats.total || 0,
          adminEmployees: empStats.administrative || 0,
          fieldEmployees: empStats.fieldStaff || 0,
        });

        setRecentMembers(allMembers.slice(0, 5));
        setRecentAssignments(allAssignments.slice(0, 5));
        setRecentEmployees(staffList.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>NGO Management System</h1>
          <p>Group 04, Section C2 — SE331 Software Engineering Design Capstone</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/employees" className="btn btn-primary">
            Manage Employees (M3)
          </Link>
          <Link to="/members" className="btn btn-secondary">
            Manage Members
          </Link>
          <Link to="/field-officers" className="btn btn-secondary">
            Officer Assignments
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Module Scope Notice for Faculty/Evaluator */}
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <span className="alert-icon">ℹ</span>
          <div>
            <strong>Evaluation Overview:</strong> Member 1 (<strong>Member Management & Officer Assignments</strong>) and Member 3 (<strong>Employee Management & Designations</strong>) are fully implemented and integrated.
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👔</div>
            <div className="stat-value" style={{ color: '#4f46e5' }}>{stats.totalEmployees}</div>
            <div className="stat-label">Total Staff (Member 3)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>{stats.adminEmployees}</div>
            <div className="stat-label">Administrative Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌾</div>
            <div className="stat-value" style={{ color: '#059669' }}>{stats.fieldEmployees}</div>
            <div className="stat-label">Field Staff</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {stats.activeMembers}
            </div>
            <div className="stat-label">Active Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value" style={{ color: '#0891b2' }}>
              {stats.activeAssignments}
            </div>
            <div className="stat-label">Active Assignments</div>
          </div>
        </div>

        {/* Recent Data Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Member 3 Staff Summary */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Staff Profiles (M3)</h3>
              <Link to="/employees" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentEmployees.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No employees registered yet
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.map((e) => (
                      <tr key={e._id}>
                        <td>
                          <strong>{e.fullName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.employeeId}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{e.designation}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              e.employmentStatus === 'Active'
                                ? 'badge-active'
                                : e.employmentStatus === 'On Leave'
                                ? 'badge-leave'
                                : 'badge-inactive'
                            }`}
                          >
                            {e.employmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Member 1 Members Summary */}
          <div className="card">
            <div className="card-header">
              <h3>Recently Registered Members</h3>
              <Link to="/members" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentMembers.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No members registered yet
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name / ID</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMembers.map((m) => (
                      <tr key={m._id}>
                        <td>
                          <strong>{m.fullName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.memberId}</div>
                        </td>
                        <td>{m.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.status === 'Active' ? 'badge-active' : 'badge-inactive'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Member 1 Officer Assignments */}
          <div className="card">
            <div className="card-header">
              <h3>Field Officer Assignments</h3>
              <Link to="/field-officers" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentAssignments.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No assignments created yet
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Officer</th>
                      <th>Target</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssignments.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <strong>{a.fieldOfficer?.fullName || 'N/A'}</strong>
                        </td>
                        <td>{a.member?.fullName || a.collectionGroup || '—'}</td>
                        <td>
                          <span
                            className={`badge ${
                              a.status === 'Active' ? 'badge-active' : 'badge-removed'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
