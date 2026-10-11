/**
 * Employee Model — Stub/Scaffold for Member 3 (SE331 Group 04 Section C2)
 * Member 3 is responsible for full Employee Management CRUD.
 * This stub is provided so Member 1's Field Officer Assignment can reference employees.
 * Member 3 should expand this model with designations, employment statuses, etc.
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
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Field Officer',
    },
    employmentStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    // isFieldOfficer flag — Member 1 uses this to filter relevant staff
    isFieldOfficer: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
