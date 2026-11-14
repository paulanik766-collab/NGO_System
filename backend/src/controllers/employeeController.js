/**
 * Employee Controller — Member 3 (SE331 Group 04 Section C2)
 * Handles full CRUD operations for administrative and field staff profiles,
 * designations, employment statuses, search/filter, and statistics.
 */
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const FieldOfficerAssignment = require('../models/FieldOfficerAssignment');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/employees ────────────────────────────────────────────────────────
// List employees with multi-criteria search, filters, pagination, and sorting
const getEmployees = async (req, res) => {
  try {
    const {
      search,
      staffType,
      employmentStatus,
      department,
      designation,
      isFieldOfficer,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Multi-field text search
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { fullName: regex },
        { employeeId: regex },
        { phone: regex },
        { email: regex },
        { designation: regex },
        { department: regex },
      ];
    }

    // Filter by staffType (Administrative vs Field Staff)
    if (staffType && ['Administrative', 'Field Staff'].includes(staffType)) {
      query.staffType = staffType;
    }

    // Filter by employmentStatus
    if (
      employmentStatus &&
      ['Active', 'Inactive', 'On Leave', 'Probation', 'Terminated'].includes(employmentStatus)
    ) {
      query.employmentStatus = employmentStatus;
    }

    // Filter by department
    if (department && department.trim()) {
      query.department = new RegExp(`^${department.trim()}$`, 'i');
    }

    // Filter by designation
    if (designation && designation.trim()) {
      query.designation = new RegExp(`^${designation.trim()}$`, 'i');
    }

    // Filter by isFieldOfficer
    if (isFieldOfficer !== undefined) {
      query.isFieldOfficer = isFieldOfficer === 'true' || isFieldOfficer === true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Employee.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/employees/stats ──────────────────────────────────────────────────
// Aggregated statistics for employee management dashboard
const getEmployeeStats = async (req, res) => {
  try {
    const [
      total,
      administrative,
      fieldStaff,
      active,
      inactive,
      onLeave,
      probation,
      designations,
      departments,
    ] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ staffType: 'Administrative' }),
      Employee.countDocuments({ staffType: 'Field Staff' }),
      Employee.countDocuments({ employmentStatus: 'Active' }),
      Employee.countDocuments({ employmentStatus: 'Inactive' }),
      Employee.countDocuments({ employmentStatus: 'On Leave' }),
      Employee.countDocuments({ employmentStatus: 'Probation' }),
      Employee.distinct('designation'),
      Employee.distinct('department'),
    ]);

    res.json({
      success: true,
      data: {
        total,
        administrative,
        fieldStaff,
        active,
        inactive,
        onLeave,
        probation,
        designations: designations.filter(Boolean).sort(),
        departments: departments.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/employees/:id ────────────────────────────────────────────────────
// Get single employee details with active field assignment metrics if applicable
const getEmployeeById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if employee has active field officer assignments
    let activeAssignmentsCount = 0;
    if (employee.isFieldOfficer) {
      activeAssignmentsCount = await FieldOfficerAssignment.countDocuments({
        fieldOfficer: employee._id,
        status: 'Active',
      });
    }

    res.json({
      success: true,
      data: employee,
      activeAssignmentsCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/employees ───────────────────────────────────────────────────────
// Register a new employee profile
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      phone,
      staffType,
      designation,
      department,
      employmentStatus,
      isFieldOfficer,
      joiningDate,
      salary,
      nidNumber,
      address,
      emergencyContact,
      bloodGroup,
      notes,
    } = req.body;

    if (!employeeId || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Full Name, and Phone are required.',
      });
    }

    // Check duplicate employeeId
    const formattedId = employeeId.toString().trim().toUpperCase();
    const existingId = await Employee.findOne({ employeeId: formattedId });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: `Employee ID "${formattedId}" is already assigned to another staff member.`,
      });
    }

    // Check duplicate email if provided
    if (email && email.trim()) {
      const existingEmail = await Employee.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: `Email "${email.trim().toLowerCase()}" is already registered.`,
        });
      }
    }

    const employee = new Employee({
      employeeId: formattedId,
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone.trim(),
      staffType: staffType || 'Administrative',
      designation: designation ? designation.trim() : 'Administrative Officer',
      department: department ? department.trim() : 'General Administration',
      employmentStatus: employmentStatus || 'Active',
      isFieldOfficer:
        isFieldOfficer !== undefined
          ? isFieldOfficer
          : staffType === 'Field Staff' || /field/i.test(designation || ''),
      joiningDate: joiningDate || Date.now(),
      salary: salary ? Number(salary) : undefined,
      nidNumber: nidNumber ? nidNumber.trim() : undefined,
      address: address ? address.trim() : undefined,
      emergencyContact: emergencyContact || {},
      bloodGroup: bloodGroup || '',
      notes: notes ? notes.trim() : '',
    });

    const saved = await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee profile created successfully',
      data: saved,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this ID or email already exists.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/employees/:id ────────────────────────────────────────────────────
// Update an existing employee profile
const updateEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const {
      employeeId,
      fullName,
      email,
      phone,
      staffType,
      designation,
      department,
      employmentStatus,
      isFieldOfficer,
      joiningDate,
      salary,
      nidNumber,
      address,
      emergencyContact,
      bloodGroup,
      notes,
    } = req.body;

    // Check duplicate employeeId conflict
    if (employeeId) {
      const formattedId = employeeId.toString().trim().toUpperCase();
      const conflict = await Employee.findOne({
        employeeId: formattedId,
        _id: { $ne: req.params.id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Employee ID "${formattedId}" is already used by another employee.`,
        });
      }
    }

    // Check duplicate email conflict
    if (email && email.trim()) {
      const emailConflict = await Employee.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: `Email "${email.trim().toLowerCase()}" is already used by another employee.`,
        });
      }
    }

    const updatePayload = {
      fullName,
      email: email ? email.trim().toLowerCase() : undefined,
      phone,
      staffType,
      designation,
      department,
      employmentStatus,
      isFieldOfficer,
      joiningDate,
      salary: salary !== undefined && salary !== '' ? Number(salary) : undefined,
      nidNumber,
      address,
      emergencyContact,
      bloodGroup,
      notes,
    };

    if (employeeId) {
      updatePayload.employeeId = employeeId.toString().trim().toUpperCase();
    }

    // Remove undefined properties
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) delete updatePayload[key];
    });

    const updated = await Employee.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error: Employee ID or email already exists.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/employees/:id/status ──────────────────────────────────────────
// Change employee employment status (Active, Inactive, On Leave, Probation, Terminated)
const updateEmployeeStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const { status } = req.body;
    const validStatuses = ['Active', 'Inactive', 'On Leave', 'Probation', 'Terminated'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // If changing to Inactive or Terminated, check active field officer assignments
    if (['Inactive', 'Terminated'].includes(status) && employee.isFieldOfficer) {
      const activeAssignments = await FieldOfficerAssignment.countDocuments({
        fieldOfficer: employee._id,
        status: 'Active',
      });
      if (activeAssignments > 0) {
        // Warning note in response or allowed with alert
      }
    }

    employee.employmentStatus = status;
    const saved = await employee.save();

    res.json({
      success: true,
      message: `Employee status changed to ${status}`,
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/employees/:id ─────────────────────────────────────────────────
// Delete an employee record with referential integrity check
const deleteEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    // Referential integrity check: Cannot delete if employee has active assignments
    const activeAssignments = await FieldOfficerAssignment.countDocuments({
      fieldOfficer: req.params.id,
      status: 'Active',
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee: This staff member has ${activeAssignments} active field officer assignment(s). Please reassign or remove the assignments before deleting.`,
      });
    }

    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee record deleted successfully',
      data: { id: req.params.id, fullName: deleted.fullName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};
