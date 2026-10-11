import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { memberAPI, assignmentAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/UIComponents';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalOfficers: 0,
    activeAssignments: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [membersRes, officersRes, assignmentsRes] = await Promise.all([
          memberAPI.getAll({ limit: 100 }),
          assignmentAPI.getFieldOfficers(),
          assignmentAPI.getAll({ limit: 100 }),
        ]);

        const allMembers = membersRes.data.data || [];
        const allAssignments = assignmentsRes.data.data || [];
        const allOfficers = officersRes.data.data || [];

        setStats({
          totalMembers: allMembers.length,
          activeMembers: allMembers.filter((m) => m.status === 'Active').length,
          inactiveMembers: allMembers.filter((m) => m.status === 'Inactive').length,
          totalOfficers: allOfficers.length,
          activeAssignments: allAssignments.filter((a) => a.status === 'Active').length,
        });

        setRecentMembers(allMembers.slice(0, 5));
        setRecentAssignments(allAssignments.slice(0, 5));
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/members" className="btn btn-primary">
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
            <strong>Member 1 Evaluation Scope:</strong> This view reflects Member 1's assigned tasks
            (<strong>Member Management</strong> & <strong>Field Officer Assignments</strong>).
            Integration points are prepared for Member 2 (Verification) and Member 3 (Employee CRUD).
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Total Registered Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {stats.activeMembers}
            </div>
            <div className="stat-label">Active Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>
              {stats.inactiveMembers}
            </div>
            <div className="stat-label">Inactive Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👔</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {stats.totalOfficers}
            </div>
            <div className="stat-label">Field Officers</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

          <div className="card">
            <div className="card-header">
              <h3>Recent Field Officer Assignments</h3>
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
