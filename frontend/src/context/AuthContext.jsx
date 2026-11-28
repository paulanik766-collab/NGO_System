import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ngo_user');
      return saved ? JSON.parse(saved) : {
        _id: 'default-admin-id',
        name: 'Jahurul Islam Prottoy',
        email: 'admin@ngo.org',
        role: 'admin',
        branch: 'Mirpur Head Office',
        isActive: true,
      };
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ngo_token') || 'demo-jwt-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo-jwt-token') {
      authAPI.getMe()
        .then((res) => {
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('ngo_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      if (res.data?.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('ngo_token', receivedToken);
        localStorage.setItem('ngo_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      if (res.data?.success) {
        return { success: true, message: 'User registered successfully' };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ngo_token');
    localStorage.removeItem('ngo_user');
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('ngo_user', JSON.stringify(updated));
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'field_officer',
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
