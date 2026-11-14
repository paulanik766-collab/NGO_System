/**
 * Loan Model — NGO Management System (SE331 Group 04 Section C2)
 * Assigned to Member 2 (Module 2: Credit, Savings & Field Operations).
 * Handles loan configuration, approval status workflow, and installment tracking.
 */
const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Installment amount cannot be negative'],
  },
  status: {
    type: String,
    enum: {
      values: ['Unpaid', 'Paid', 'Overdue'],
      message: 'Status must be Unpaid, Paid, or Overdue',
    },
    default: 'Unpaid',
  },
  paidDate: {
    type: Date,
    default: null,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
});

const loanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    principalAmount: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [1000, 'Minimum loan amount is 1,000 BDT'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
    },
    termDuration: {
      type: Number,
      required: [true, 'Term duration is required'],
      min: [1, 'Term duration must be at least 1'],
    },
    termType: {
      type: String,
      enum: {
        values: ['Monthly', 'Weekly'],
        message: 'Term type must be either Monthly or Weekly',
      },
      default: 'Monthly',
    },
    totalInterest: {
      type: Number,
      required: true,
    },
    totalPayable: {
      type: Number,
      required: true,
    },
    installmentAmount: {
      type: Number,
      required: true,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
      trim: true,
      maxlength: [200, 'Purpose cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Disbursed', 'Closed'],
        message: 'Invalid loan status',
      },
      default: 'Pending',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    disbursedDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    installments: [installmentSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
loanSchema.index({ member: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ 'installments.dueDate': 1, 'installments.status': 1 });

module.exports = mongoose.model('Loan', loanSchema);
