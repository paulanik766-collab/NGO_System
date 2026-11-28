import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, register, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'field_officer',
    phone: '',
    branch: 'Mirpur Branch',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleQuickDemoLogin = async (roleName, demoEmail, demoPass = 'password123') => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login({ email: demoEmail, password: demoPass });
    if (res.success) {
      setSuccessMsg(`Logged in successfully as ${roleName}`);
      setTimeout(() => navigate('/'), 600);
    } else {
      await register({
        name: `Demo ${roleName}`,
        email: demoEmail,
        password: demoPass,
        role: roleName.toLowerCase().replace(' ', '_'),
        branch: 'Mirpur Branch',
        phone: '01700000000',
      });
      const retry = await login({ email: demoEmail, password: demoPass });
      if (retry.success) {
        setSuccessMsg(`Logged in successfully as ${roleName}`);
        setTimeout(() => navigate('/'), 600);
      } else {
        setErrorMsg('Could not log in. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegisterMode) {
      if (!formData.name || !formData.email || !formData.password) {
        setErrorMsg('Please fill all required fields');
        setLoading(false);
        return;
      }
      const res = await register(formData);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Logging you in...');
        const logRes = await login({ email: formData.email, password: formData.password });
        if (logRes.success) {
          setTimeout(() => navigate('/'), 800);
        } else {
          setIsRegisterMode(false);
        }
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!formData.email || !formData.password) {
        setErrorMsg('Please provide email and password');
        setLoading(false);
        return;
      }
      const res = await login({ email: formData.email, password: formData.password });
      if (res.success) {
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 600);
      } else {
        setErrorMsg(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            {isRegisterMode ? 'Create Staff Account' : 'NGO System Login'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            SE331 Member 3 • Secure JWT & Role-Based Access Control
          </p>
        </div>

        {user && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Currently Active Session</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name} ({user.role?.toUpperCase()})</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/')}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Jahurul Islam Prottoy"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Assigned System Role *</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Admin / Executive Director</option>
                  <option value="manager">Branch Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="field_officer">Field Officer</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Branch Location</label>
                <input
                  type="text"
                  name="branch"
                  className="form-control"
                  placeholder="e.g. Mirpur Branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Work Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. user@ngo.org"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Password *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Register Account' : 'Sign In with JWT'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
            }}
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register new staff"}
          </button>
        </div>

        <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            marginBottom: '10px',
            textAlign: 'center',
          }}>
            Quick Demo Stakeholder Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleQuickDemoLogin('Admin', 'admin@ngo.org')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleQuickDemoLogin('Manager', 'manager@ngo.org')}
            >
              🏢 Branch Manager
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleQuickDemoLogin('Accountant', 'accountant@ngo.org')}
            >
              💼 Accountant
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleQuickDemoLogin('Field Officer', 'field@ngo.org')}
            >
              🏃 Field Officer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
