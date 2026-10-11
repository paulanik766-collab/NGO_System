/**
 * Verification Model — Member 2 (SE331 Group 04 Section C2)
 * Tracks document uploads (NID, Photo) and verification status for NGO members.
 * References the Member model via ObjectId (does not modify Member schema).
 */
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    documentType: {
      type: String,
      enum: {
        values: ['NID', 'Photo', 'Other'],
        message: 'Document type must be NID, Photo, or Other',
      },
      required: [true, 'Document type is required'],
    },
    documentPath: {
      type: String,
      required: [true, 'Document file path is required'],
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Verified', 'Rejected'],
        message: 'Status must be Pending, Verified, or Rejected',
      },
      default: 'Pending',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups by member and document type
verificationSchema.index({ member: 1, documentType: 1 });

// Index for filtering by verification status
verificationSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
