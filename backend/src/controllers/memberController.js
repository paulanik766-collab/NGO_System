/**
 * Member Controller — Member 1 (SE331 Group 04 Section C2)
 * Handles CRUD for NGO Members, status toggle, and search.
 */
const Member = require('../models/Member');
const mongoose = require('mongoose');

// ─── Helper ────────────────────────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/members ──────────────────────────────────────────────────────────
// List all members, with optional search query (?search=...)
const getMembers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { fullName: regex },
        { memberId: regex },
        { phone: regex },
      ];
    }

    if (status && ['Active', 'Inactive'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [members, total] = await Promise.all([
      Member.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Member.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: members,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/members ─────────────────────────────────────────────────────────
// Register a new member
const createMember = async (req, res) => {
  try {
    const { memberId, fullName, phone, email, address, joinDate, status } = req.body;

    // Check duplicate memberId
    const existing = await Member.findOne({ memberId: memberId?.toString().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Member ID "${memberId}" is already in use. Please choose a unique ID.`,
      });
    }

    const member = new Member({ memberId, fullName, phone, email, address, joinDate, status });
    const saved = await member.save();

    res.status(201).json({ success: true, message: 'Member registered successfully', data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Member ID already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/members/:id ──────────────────────────────────────────────────────
// Get a single member by MongoDB _id
const getMemberById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/members/:id ──────────────────────────────────────────────────────
// Update member profile
const updateMember = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const { memberId, fullName, phone, email, address, joinDate, status } = req.body;

    // Check if another member uses the same memberId
    if (memberId) {
      const conflict = await Member.findOne({
        memberId: memberId.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Member ID "${memberId}" is already in use by another member.`,
        });
      }
    }

    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      { memberId, fullName, phone, email, address, joinDate, status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member updated successfully', data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Member ID already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/members/:id/status ────────────────────────────────────────────
// Toggle member Active/Inactive status
const toggleMemberStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.status = member.status === 'Active' ? 'Inactive' : 'Active';
    await member.save();

    res.json({
      success: true,
      message: `Member status changed to ${member.status}`,
      data: member,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/members/:id ───────────────────────────────────────────────────
// Delete a member
const deleteMember = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getMembers, createMember, getMemberById, updateMember, toggleMemberStatus, deleteMember };
