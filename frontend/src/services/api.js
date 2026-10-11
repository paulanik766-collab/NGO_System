/**
 * Axios API Service — NGO Management System
 * Centralised HTTP client for all API calls.
 */
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Member API (Member 1) ───────────────────────────────────────────────────────
export const memberAPI = {
  /** GET /api/members?search=&status=&page=&limit= */
  getAll: (params = {}) => API.get('/members', { params }),

  /** GET /api/members/:id */
  getById: (id) => API.get(`/members/${id}`),

  /** POST /api/members */
  create: (data) => API.post('/members', data),

  /** PUT /api/members/:id */
  update: (id, data) => API.put(`/members/${id}`, data),

  /** PATCH /api/members/:id/status */
  toggleStatus: (id) => API.patch(`/members/${id}/status`),

  /** DELETE /api/members/:id */
  delete: (id) => API.delete(`/members/${id}`),
};

// ─── Assignment API (Member 1) ───────────────────────────────────────────────────
export const assignmentAPI = {
  /** GET /api/field-officers */
  getFieldOfficers: () => API.get('/field-officers'),

  /** GET /api/assignments?fieldOfficer=&member=&status= */
  getAll: (params = {}) => API.get('/assignments', { params }),

  /** GET /api/assignments/:id */
  getById: (id) => API.get(`/assignments/${id}`),

  /** POST /api/assignments */
  create: (data) => API.post('/assignments', data),

  /** PUT /api/assignments/:id */
  update: (id, data) => API.put(`/assignments/${id}`, data),

  /** DELETE /api/assignments/:id */
  remove: (id) => API.delete(`/assignments/${id}`),

  /** GET /api/assignments/officer/:officerId */
  getByOfficer: (officerId) => API.get(`/assignments/officer/${officerId}`),
};

// ─── Employee API (Member 3) ─────────────────────────────────────────────────────
export const employeeAPI = {
  /** GET /api/employees?search=&staffType=&employmentStatus=&department=&designation=&page=&limit= */
  getAll: (params = {}) => API.get('/employees', { params }),

  /** GET /api/employees/stats */
  getStats: () => API.get('/employees/stats'),

  /** GET /api/employees/:id */
  getById: (id) => API.get(`/employees/${id}`),

  /** POST /api/employees */
  create: (data) => API.post('/employees', data),

  /** PUT /api/employees/:id */
  update: (id, data) => API.put(`/employees/${id}`, data),

  /** PATCH /api/employees/:id/status */
  updateStatus: (id, status) => API.patch(`/employees/${id}/status`, { status }),

  /** DELETE /api/employees/:id */
  delete: (id) => API.delete(`/employees/${id}`),
};

// ─── Verification API (Member 2) ───────────────────────────────────────────────
export const verificationAPI = {
  /** GET /api/verifications?status=&documentType=&member= */
  getAll: (params = {}) => API.get('/verifications', { params }),

  /** GET /api/verifications/:id */
  getById: (id) => API.get(`/verifications/${id}`),

  /** GET /api/verifications/member/:memberId */
  getByMember: (memberId) => API.get(`/verifications/member/${memberId}`),

  /** POST /api/verifications/upload (multipart/form-data) */
  upload: (formData) =>
    API.post('/verifications/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** PATCH /api/verifications/:id/status */
  updateStatus: (id, data) => API.patch(`/verifications/${id}/status`, data),

  /** DELETE /api/verifications/:id */
  delete: (id) => API.delete(`/verifications/${id}`),
};

export default API;
