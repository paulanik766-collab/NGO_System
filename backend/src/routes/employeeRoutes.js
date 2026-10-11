/**
 * Employee Routes — Scaffold for Member 3 (SE331 Group 04 Section C2)
 * Member 3 should replace/expand this file with full Employee Management CRUD.
 * This minimal version lets Member 1 seed test field officers.
 */
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET /api/employees — List employees (Member 3 will expand)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ fullName: 1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees — Create employee (for seeding / Member 3 to expand)
router.post('/', async (req, res) => {
  try {
    const emp = new Employee(req.body);
    const saved = await emp.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Employee ID already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
