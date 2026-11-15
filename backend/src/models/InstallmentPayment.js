/**
 * InstallmentPayment Model — Member 3 (Module 2: Installment Management)
 * SE331 Software Engineering Design Capstone Project (Group 04 Section C2)
 *
 * Records individual installment payment transactions with payment method,
 * collection details, field officer / collector reference, and receipt tracking.
 */
const mongoose = require('mongoose');

const installmentPaymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    installmentNumber: {
      type: Number,
      required: [true, 'Installment number is required'],
      min: [1, 'Installment number must be at least 1'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Rocket'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'Cash',
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    collectorName: {
      type: String,
      trim: true,
      default: 'Field Officer',
    },
    lateFine: {
      type: Number,
      default: 0,
      min: [0, 'Late fine cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast ledger lookups and reporting
installmentPaymentSchema.index({ loan: 1, installmentNumber: 1 });
installmentPaymentSchema.index({ member: 1 });
installmentPaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('InstallmentPayment', installmentPaymentSchema);
