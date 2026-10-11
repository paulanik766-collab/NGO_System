/**
 * Employee Model — Member 3 (SE331 Group 04 Section C2)
 * Manages administrative and field staff profiles, designations, and employment statuses.
 * Compatible with Member 1's Field Officer Assignment module.
 */
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    staffType: {
      type: String,
      required: [true, 'Staff type is required'],
      enum: {
        values: ['Administrative', 'Field Staff'],
        message: '{VALUE} is not a valid staff type. Allowed: Administrative, Field Staff',
      },
      default: 'Administrative',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      default: 'Administrative Officer',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'General Administration',
    },
    employmentStatus: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'On Leave', 'Probation', 'Terminated'],
        message: '{VALUE} is not a valid employment status',
      },
      default: 'Active',
    },
    // isFieldOfficer flag — used by Member 1's Field Officer Assignment system
    isFieldOfficer: {
      type: Boolean,
      default: false,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    nidNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: '' },
    },
    bloodGroup: {
      type: String,
      enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: '',
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

// Auto-sync isFieldOfficer flag based on staffType or designation
employeeSchema.pre('save', function (next) {
  if (this.staffType === 'Field Staff' || /field/i.test(this.designation)) {
    this.isFieldOfficer = true;
  }
  next();
});

// Text index for search functionality
employeeSchema.index({ fullName: 'text', employeeId: 'text', designation: 'text', department: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
