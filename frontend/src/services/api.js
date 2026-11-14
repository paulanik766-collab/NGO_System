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

// ─── Savings API (Member 1 - Module 2) ───────────────────────────────────────────
export const savingsAPI = {
  /** GET /api/savings/accounts?search=&status=&page=&limit= */
  getAccounts: (params = {}) => API.get('/savings/accounts', { params }),

  /** GET /api/savings/accounts/:id */
  getAccountById: (id) => API.get(`/savings/accounts/${id}`),

  /** POST /api/savings/accounts */
  createAccount: (data) => API.post('/savings/accounts', data),

  /** PATCH /api/savings/accounts/:id/status */
  updateAccountStatus: (id, status) => API.patch(`/savings/accounts/${id}/status`, { status }),

  /** GET /api/savings/ledger?accountId=&memberId=&type=&savingsType=&startDate=&endDate=&search=&page=&limit= */
  getLedger: (params = {}) => API.get('/savings/ledger', { params }),

  /** POST /api/savings/transactions */
  createTransaction: (data) => API.post('/savings/transactions', data),

  /** GET /api/savings/stats */
  getStats: () => API.get('/savings/stats'),

  /** GET /api/savings/member/:memberId */
  getMemberSavings: (memberId) => API.get(`/savings/member/${memberId}`),
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

// ─── Loan API (Member 2 — Module 2) ────────────────────────────────────────────
export const loanAPI = {
  /** GET /api/loans?status=&member=&search= */
  getAll: (params = {}) => API.get('/loans', { params }),

  /** GET /api/loans/:id */
  getById: (id) => API.get(`/loans/${id}`),

  /** POST /api/loans */
  create: (data) => API.post('/loans', data),

  /** PATCH /api/loans/:id/status */
  updateStatus: (id, data) => API.patch(`/loans/${id}/status`, data),

  /** POST /api/loans/:id/installments/:installmentNumber/pay */
  payInstallment: (id, installmentNumber, data = {}) =>
    API.post(`/loans/${id}/installments/${installmentNumber}/pay`, data),

  /** DELETE /api/loans/:id */
  delete: (id) => API.delete(`/loans/${id}`),
};

// ─── Due & Overdue API (Member 2 — Module 2) ───────────────────────────────────
export const dueOverdueAPI = {
  /** GET /api/due-overdue/summary */
  getSummary: () => API.get('/due-overdue/summary'),

  /** GET /api/due-overdue/defaulters?riskLevel=&search= */
  getDefaulters: (params = {}) => API.get('/due-overdue/defaulters', { params }),

  /** GET /api/due-overdue/upcoming?days= */
  getUpcoming: (params = {}) => API.get('/due-overdue/upcoming', { params }),
};

export default API;
