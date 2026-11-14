/**
 * Employee Routes — Member 3 (SE331 Group 04 Section C2)
 * Full CRUD, search, status management, and statistics for NGO Employees.
 */
const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} = require('../controllers/employeeController');

// ─── Route Definitions ────────────────────────────────────────────────────────
// GET /api/employees/stats — Aggregated employee statistics
router.get('/stats', getEmployeeStats);

// GET /api/employees — List employees with search, filter, pagination
router.get('/', getEmployees);

// POST /api/employees — Register a new employee
router.post('/', createEmployee);

// GET /api/employees/:id — Get details of a single employee
router.get('/:id', getEmployeeById);

// PUT /api/employees/:id — Update employee profile
router.put('/:id', updateEmployee);

// PATCH /api/employees/:id/status — Update employment status
router.patch('/:id/status', updateEmployeeStatus);

// DELETE /api/employees/:id — Delete employee record
router.delete('/:id', deleteEmployee);

module.exports = router;
