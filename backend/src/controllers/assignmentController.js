/**
 * Field Officer Assignment Controller — Member 1 (SE331 Group 04 Section C2)
 * Manages assignments linking field officers (Employees) to Members/Groups.
 * Uses Employee model (Member 3's domain) in read-only fashion.
 */
const FieldOfficerAssignment = require('../models/FieldOfficerAssignment');
const Employee = require('../models/Employee');
const Member = require('../models/Member');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/assignments ──────────────────────────────────────────────────────
// List all assignments with optional filters
const getAssignments = async (req, res) => {
  try {
    const { fieldOfficer, member, collectionGroup, status } = req.query;
    const query = {};

    if (fieldOfficer && isValidObjectId(fieldOfficer)) query.fieldOfficer = fieldOfficer;
    if (member && isValidObjectId(member)) query.member = member;
    if (collectionGroup) query.collectionGroup = new RegExp(collectionGroup, 'i');
    if (status && ['Active', 'Removed'].includes(status)) query.status = status;

    const assignments = await FieldOfficerAssignment.find(query)
      .populate('fieldOfficer', 'employeeId fullName designation phone email')
      .populate('member', 'memberId fullName phone status')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments, total: assignments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/assignments ─────────────────────────────────────────────────────
// Create a new field officer assignment
const createAssignment = async (req, res) => {
  try {
    const { fieldOfficer, member, collectionGroup, notes, assignmentDate } = req.body;

    if (!fieldOfficer) {
      return res.status(400).json({ success: false, message: 'Field officer is required.' });
    }
    if (!isValidObjectId(fieldOfficer)) {
      return res.status(400).json({ success: false, message: 'Invalid field officer ID.' });
    }
    if (!member && !collectionGroup) {
      return res.status(400).json({
        success: false,
        message: 'Assignment must target either a Member or a Collection Group.',
      });
    }

    // Validate field officer exists
    const officer = await Employee.findById(fieldOfficer);
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Field officer not found.' });
    }
    if (officer.employmentStatus === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: `${officer.fullName} is currently Inactive and cannot be assigned.`,
      });
    }

    // Validate member if provided
    if (member) {
      if (!isValidObjectId(member)) {
        return res.status(400).json({ success: false, message: 'Invalid member ID.' });
      }
      const memberDoc = await Member.findById(member);
      if (!memberDoc) {
        return res.status(404).json({ success: false, message: 'Member not found.' });
      }
      if (memberDoc.status === 'Inactive') {
        return res.status(400).json({
          success: false,
          message: `Member "${memberDoc.fullName}" is Inactive. Activate the member before assigning.`,
        });
      }

      // Check duplicate active assignment for same officer+member
      const duplicate = await FieldOfficerAssignment.findOne({
        fieldOfficer,
        member,
        status: 'Active',
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'This field officer is already actively assigned to this member.',
        });
      }
    }

    const assignment = new FieldOfficerAssignment({
      fieldOfficer,
      member: member || null,
      collectionGroup: collectionGroup || null,
      notes,
      assignmentDate,
    });
    const saved = await assignment.save();
    const populated = await FieldOfficerAssignment.findById(saved._id)
      .populate('fieldOfficer', 'employeeId fullName designation phone email')
      .populate('member', 'memberId fullName phone status');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate assignment: this officer is already assigned to this member.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/assignments/:id ──────────────────────────────────────────────────
const getAssignmentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment ID format' });
    }
    const assignment = await FieldOfficerAssignment.findById(req.params.id)
      .populate('fieldOfficer', 'employeeId fullName designation phone email')
      .populate('member', 'memberId fullName phone status');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/assignments/:id ──────────────────────────────────────────────────
// Update assignment (notes, collectionGroup, assignmentDate)
const updateAssignment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment ID format' });
    }
    const { notes, collectionGroup, assignmentDate, status } = req.body;

    const updated = await FieldOfficerAssignment.findByIdAndUpdate(
      req.params.id,
      { notes, collectionGroup, assignmentDate, status },
      { new: true, runValidators: true }
    )
      .populate('fieldOfficer', 'employeeId fullName designation phone email')
      .populate('member', 'memberId fullName phone status');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/assignments/:id ───────────────────────────────────────────────
// Remove (soft-delete) an assignment by setting status = 'Removed'
const removeAssignment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment ID format' });
    }
    const assignment = await FieldOfficerAssignment.findByIdAndUpdate(
      req.params.id,
      { status: 'Removed' },
      { new: true }
    );
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment removed successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/assignments/officer/:officerId ───────────────────────────────────
// Get all assignments for a specific field officer
const getAssignmentsByOfficer = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.officerId)) {
      return res.status(400).json({ success: false, message: 'Invalid officer ID format' });
    }
    const assignments = await FieldOfficerAssignment.find({
      fieldOfficer: req.params.officerId,
      status: 'Active',
    })
      .populate('fieldOfficer', 'employeeId fullName designation')
      .populate('member', 'memberId fullName phone status')
      .sort({ assignmentDate: -1 });

    res.json({ success: true, data: assignments, total: assignments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/field-officers ───────────────────────────────────────────────────
// List all employees who are field officers (reuses Employee model from Member 3)
const getFieldOfficers = async (req, res) => {
  try {
    const officers = await Employee.find({ isFieldOfficer: true }).sort({ fullName: 1 });
    res.json({ success: true, data: officers, total: officers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  getAssignmentById,
  updateAssignment,
  removeAssignment,
  getAssignmentsByOfficer,
  getFieldOfficers,
};
