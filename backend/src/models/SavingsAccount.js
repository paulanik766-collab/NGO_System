const mongoose = require('mongoose');

const savingsAccountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    accountType: {
      type: String,
      enum: ['General Savings', 'Mandatory DPS', 'Voluntary Savings'],
      default: 'General Savings',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    mandatoryAmount: {
      type: Number,
      default: 200,
      min: [0, 'Mandatory amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Closed'],
      default: 'Active',
    },
    openedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

savingsAccountSchema.index({ member: 1, status: 1 });
savingsAccountSchema.index({ accountNumber: 'text' });

module.exports = mongoose.model('SavingsAccount', savingsAccountSchema);
