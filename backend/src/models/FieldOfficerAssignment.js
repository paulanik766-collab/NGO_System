/**
 * FieldOfficerAssignment Model — Member 1 (SE331 Group 04 Section C2)
 * Links a field officer (Employee) with a Member and/or Collection Group.
 * Prevents duplicate active assignments for the same officer+member pair.
 */
const mongoose = require('mongoose');

const fieldOfficerAssignmentSchema = new mongoose.Schema(
  {
    fieldOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Field officer is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    collectionGroup: {
      type: String,
      trim: true,
      default: null,
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Removed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active assignment for the same officer+member pair
fieldOfficerAssignmentSchema.index(
  { fieldOfficer: 1, member: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Active', member: { $ne: null } },
  }
);

module.exports = mongoose.model('FieldOfficerAssignment', fieldOfficerAssignmentSchema);
