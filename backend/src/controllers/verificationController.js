/**
 * Verification Controller — Member 2 (SE331 Group 04 Section C2)
 * Handles document upload, listing, status updates, and deletion
 * for NGO member verification documents.
 */
const Verification = require('../models/Verification');
const Member = require('../models/Member');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ─── Helper ────────────────────────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/verifications ────────────────────────────────────────────────────
// List all verification records with optional filters
const getVerifications = async (req, res) => {
  try {
    const { status, documentType, member, search } = req.query;
    const query = {};

    if (status && ['Pending', 'Verified', 'Rejected'].includes(status)) {
      query.verificationStatus = status;
    }
    if (documentType && ['NID', 'Photo', 'Other'].includes(documentType)) {
      query.documentType = documentType;
    }
    if (member && isValidObjectId(member)) {
      query.member = member;
    }

    let verifications = await Verification.find(query)
      .populate('member', 'memberId fullName phone status')
      .sort({ createdAt: -1 });

    // If search is provided, filter by populated member fields
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      verifications = verifications.filter(
        (v) =>
          v.member &&
          (regex.test(v.member.fullName) || regex.test(v.member.memberId))
      );
    }

    res.json({
      success: true,
      data: verifications,
      total: verifications.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/verifications/:id ────────────────────────────────────────────────
// Get a single verification record
const getVerificationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid verification ID format' });
    }

    const verification = await Verification.findById(req.params.id)
      .populate('member', 'memberId fullName phone email address status');

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/verifications/member/:memberId ───────────────────────────────────
// Get all verification documents for a specific member
const getVerificationsByMember = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const member = await Member.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const verifications = await Verification.find({ member: req.params.memberId })
      .populate('member', 'memberId fullName phone status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: verifications,
      total: verifications.length,
      member: { _id: member._id, memberId: member.memberId, fullName: member.fullName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/verifications/upload ────────────────────────────────────────────
// Upload a verification document for a member
const uploadDocument = async (req, res) => {
  try {
    const { member, documentType } = req.body;

    // Validate required fields
    if (!member) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }
    if (!isValidObjectId(member)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format.' });
    }
    if (!documentType || !['NID', 'Photo', 'Other'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required and must be NID, Photo, or Other.',
      });
    }

    // Validate member exists
    const memberDoc = await Member.findById(member);
    if (!memberDoc) {
      // If a file was uploaded, clean it up
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required. Accepted types: JPEG, PNG, PDF (max 5 MB).',
      });
    }

    // Create verification record
    const verification = new Verification({
      member,
      documentType,
      documentPath: `uploads/documents/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      verificationStatus: 'Pending',
      submittedAt: new Date(),
    });

    const saved = await verification.save();
    const populated = await Verification.findById(saved._id)
      .populate('member', 'memberId fullName phone status');

    res.status(201).json({
      success: true,
      message: `${documentType} document uploaded successfully for ${memberDoc.fullName}`,
      data: populated,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/verifications/:id/status ───────────────────────────────────────
// Update verification status (Pending → Verified or Rejected)
const updateVerificationStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid verification ID format' });
    }

    const { status, remarks } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status is required and must be either Verified or Rejected.',
      });
    }

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    verification.verificationStatus = status;
    verification.reviewedAt = new Date();
    if (remarks !== undefined) {
      verification.remarks = remarks;
    }

    await verification.save();

    const populated = await Verification.findById(verification._id)
      .populate('member', 'memberId fullName phone status');

    res.json({
      success: true,
      message: `Document verification status updated to ${status}`,
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/verifications/:id ─────────────────────────────────────────────
// Delete a verification record and its associated file
const deleteVerification = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid verification ID format' });
    }

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    // Delete the associated file from disk
    const filePath = path.join(__dirname, '../..', verification.documentPath);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error(`Warning: Could not delete file ${filePath}:`, err.message);
      }
    });

    await Verification.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Verification record and document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVerifications,
  getVerificationById,
  getVerificationsByMember,
  uploadDocument,
  updateVerificationStatus,
  deleteVerification,
};
