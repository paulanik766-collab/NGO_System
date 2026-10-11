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

export default API;
