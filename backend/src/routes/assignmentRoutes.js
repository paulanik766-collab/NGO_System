/**
 * Assignment & Field Officer Routes — Member 1 (SE331 Group 04 Section C2)
 */
const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  getAssignmentById,
  updateAssignment,
  removeAssignment,
  getAssignmentsByOfficer,
  getFieldOfficers,
} = require('../controllers/assignmentController');

// GET  /api/field-officers — List all field officers (reads Employee collection)
// NOTE: This route is defined here. Member 3 may also add employee routes at /api/employees.
router.get('/field-officers', getFieldOfficers);

// GET    /api/assignments                        — List assignments (with filters)
// POST   /api/assignments                        — Create new assignment
router.route('/assignments').get(getAssignments).post(createAssignment);

// GET    /api/assignments/:id                    — Get assignment details
// PUT    /api/assignments/:id                    — Update assignment
// DELETE /api/assignments/:id                    — Remove (soft-delete) assignment
router.route('/assignments/:id').get(getAssignmentById).put(updateAssignment).delete(removeAssignment);

// GET  /api/assignments/officer/:officerId       — All assignments for one officer
router.get('/assignments/officer/:officerId', getAssignmentsByOfficer);

module.exports = router;
