const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'loan_disbursement',
        'installment_payment',
        'savings_deposit',
        'savings_withdrawal',
        'fee_payment',
        'adjustment',
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
      trim: true,
    },
    referenceModel: {
      type: String,
      enum: ['Loan', 'InstallmentPayment', 'SavingsLedger', 'Receipt', 'Manual', ''],
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Cheque'],
      default: 'Cash',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Reversed'],
      default: 'Completed',
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    performedBy: {
      type: String,
      default: 'System',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ member: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ transactionDate: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
