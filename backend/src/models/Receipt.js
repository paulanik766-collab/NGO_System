const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    collectionType: {
      type: String,
      enum: ['Savings Deposit', 'Loan Installment', 'Membership Fee', 'Other Collection'],
      default: 'Savings Deposit',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
      default: 'Cash',
    },
    collectedBy: {
      type: String,
      trim: true,
      default: 'Field Officer',
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

receiptSchema.index({ member: 1, collectionDate: -1 });
receiptSchema.index({ receiptNumber: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
