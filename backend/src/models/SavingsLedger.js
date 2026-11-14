const mongoose = require('mongoose');

const savingsLedgerSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsAccount',
      required: [true, 'Savings account is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal'],
      required: [true, 'Transaction type is required'],
    },
    savingsType: {
      type: String,
      enum: ['Mandatory', 'Voluntary'],
      required: [true, 'Savings type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than zero'],
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Rocket'],
      default: 'Cash',
    },
    collectedBy: {
      type: String,
      trim: true,
      default: 'Field Officer',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

savingsLedgerSchema.index({ account: 1, date: -1 });
savingsLedgerSchema.index({ member: 1, date: -1 });
savingsLedgerSchema.index({ type: 1, savingsType: 1 });

module.exports = mongoose.model('SavingsLedger', savingsLedgerSchema);
