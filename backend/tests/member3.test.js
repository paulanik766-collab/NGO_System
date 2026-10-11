/**
 * Test Suite: Member 3 — Employee Management (SE331 Group 04 Section C2)
 * Tests Employee Model, Controller, Routes, Validations, Status Updates,
 * Referential Integrity with Field Officer Assignments.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const employeeRoutes = require('../src/routes/employeeRoutes');
const assignmentRoutes = require('../src/routes/assignmentRoutes');
const memberRoutes = require('../src/routes/memberRoutes');
const Employee = require('../src/models/Employee');
const FieldOfficerAssignment = require('../src/models/FieldOfficerAssignment');
const Member = require('../src/models/Member');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/employees', employeeRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api', assignmentRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Employee.deleteMany({});
  await FieldOfficerAssignment.deleteMany({});
  await Member.deleteMany({});
});

describe('Member 3 - Employee Management API', () => {
  // ─── 1. Employee Creation ───────────────────────────────────────────────────
  describe('POST /api/employees — Create Employee', () => {
    test('should register a new administrative employee successfully', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'ADM-001',
          fullName: 'Tanvir Ahmed',
          email: 'tanvir@ngo.org',
          phone: '+8801711223344',
          staffType: 'Administrative',
          designation: 'Finance Officer',
          department: 'Finance & Accounts',
          employmentStatus: 'Active',
          salary: 45000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('ADM-001');
      expect(res.body.data.fullName).toBe('Tanvir Ahmed');
      expect(res.body.data.designation).toBe('Finance Officer');
      expect(res.body.data.staffType).toBe('Administrative');
      expect(res.body.data.isFieldOfficer).toBe(false);
    });

    test('should automatically flag field staff as isFieldOfficer: true', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'FLD-101',
          fullName: 'Rahim Mia',
          phone: '+8801811223344',
          staffType: 'Field Staff',
          designation: 'Field Officer',
          department: 'Field Operations',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFieldOfficer).toBe(true);
    });

    test('should reject creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          fullName: 'Missing ID and Phone',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject duplicate employeeId (case insensitive)', async () => {
      await Employee.create({
        employeeId: 'EMP-005',
        fullName: 'Existing Employee',
        phone: '+8801999888777',
        staffType: 'Administrative',
        designation: 'HR Officer',
        department: 'Human Resources',
      });

      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'emp-005', // should conflict
          fullName: 'Duplicate Employee',
          phone: '+8801555444333',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already assigned/i);
    });

    test('should reject duplicate email address', async () => {
      await Employee.create({
        employeeId: 'EMP-010',
        fullName: 'First Staff',
        email: 'staff@ngo.org',
        phone: '+8801700000001',
        staffType: 'Administrative',
        designation: 'Admin Officer',
        department: 'Administration',
      });

      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'EMP-011',
          fullName: 'Second Staff',
          email: 'staff@ngo.org',
          phone: '+8801700000002',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });

  // ─── 2. Listing, Search & Filters ───────────────────────────────────────────
  describe('GET /api/employees — Listing, Search & Filters', () => {
    beforeEach(async () => {
      await Employee.create([
        {
          employeeId: 'ADM-101',
          fullName: 'Farhana Yasmin',
          email: 'farhana@ngo.org',
          phone: '+8801711111111',
          staffType: 'Administrative',
          designation: 'Executive Director',
          department: 'Administration',
          employmentStatus: 'Active',
          isFieldOfficer: false,
        },
        {
          employeeId: 'FLD-201',
          fullName: 'Nazrul Islam',
          email: 'nazrul@ngo.org',
          phone: '+8801722222222',
          staffType: 'Field Staff',
          designation: 'Field Supervisor',
          department: 'Field Operations',
          employmentStatus: 'Active',
          isFieldOfficer: true,
        },
        {
          employeeId: 'FLD-202',
          fullName: 'Sadia Sultana',
          email: 'sadia@ngo.org',
          phone: '+8801733333333',
          staffType: 'Field Staff',
          designation: 'Field Officer',
          department: 'Field Operations',
          employmentStatus: 'On Leave',
          isFieldOfficer: true,
        },
      ]);
    });

    test('should return all employees with pagination metadata', async () => {
      const res = await request(app).get('/api/employees');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.pagination.total).toBe(3);
    });

    test('should search employees by name or designation', async () => {
      const res = await request(app).get('/api/employees?search=Nazrul');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].employeeId).toBe('FLD-201');

      const res2 = await request(app).get('/api/employees?search=Director');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(1);
      expect(res2.body.data[0].employeeId).toBe('ADM-101');
    });

    test('should filter by staffType', async () => {
      const res = await request(app).get('/api/employees?staffType=Administrative');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].fullName).toBe('Farhana Yasmin');

      const resField = await request(app).get('/api/employees?staffType=Field Staff');
      expect(resField.status).toBe(200);
      expect(resField.body.data.length).toBe(2);
    });

    test('should filter by employmentStatus', async () => {
      const res = await request(app).get('/api/employees?employmentStatus=On Leave');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].employeeId).toBe('FLD-202');
    });
  });

  // ─── 3. Employee Statistics ─────────────────────────────────────────────────
  describe('GET /api/employees/stats — Aggregated Statistics', () => {
    test('should return accurate employee counts and distinct categories', async () => {
      await Employee.create([
        {
          employeeId: 'E1',
          fullName: 'Emp One',
          phone: '0171',
          staffType: 'Administrative',
          designation: 'Finance Officer',
          department: 'Finance',
          employmentStatus: 'Active',
        },
        {
          employeeId: 'E2',
          fullName: 'Emp Two',
          phone: '0172',
          staffType: 'Field Staff',
          designation: 'Field Officer',
          department: 'Field Operations',
          employmentStatus: 'Active',
        },
        {
          employeeId: 'E3',
          fullName: 'Emp Three',
          phone: '0173',
          staffType: 'Field Staff',
          designation: 'Field Officer',
          department: 'Field Operations',
          employmentStatus: 'On Leave',
        },
      ]);

      const res = await request(app).get('/api/employees/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.administrative).toBe(1);
      expect(res.body.data.fieldStaff).toBe(2);
      expect(res.body.data.active).toBe(2);
      expect(res.body.data.onLeave).toBe(1);
      expect(res.body.data.designations).toContain('Finance Officer');
      expect(res.body.data.designations).toContain('Field Officer');
    });
  });

  // ─── 4. Employee Profile Updates ────────────────────────────────────────────
  describe('PUT /api/employees/:id — Update Profile', () => {
    test('should update employee designation and department', async () => {
      const emp = await Employee.create({
        employeeId: 'EMP-301',
        fullName: 'Mahmudul Hasan',
        phone: '+8801900000000',
        staffType: 'Administrative',
        designation: 'Junior Officer',
        department: 'Operations',
      });

      const res = await request(app)
        .put(`/api/employees/${emp._id}`)
        .send({
          fullName: 'Mahmudul Hasan',
          designation: 'Senior Project Manager',
          department: 'Program Management',
          salary: 60000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('Senior Project Manager');
      expect(res.body.data.department).toBe('Program Management');
      expect(res.body.data.salary).toBe(60000);
    });
  });

  // ─── 5. Status Management ───────────────────────────────────────────────────
  describe('PATCH /api/employees/:id/status — Status Update', () => {
    test('should change employment status to On Leave and Inactive', async () => {
      const emp = await Employee.create({
        employeeId: 'EMP-401',
        fullName: 'Karim Mollah',
        phone: '+8801800000000',
        staffType: 'Field Staff',
        designation: 'Field Officer',
        department: 'Field Operations',
        employmentStatus: 'Active',
      });

      // Update to On Leave
      const leaveRes = await request(app)
        .patch(`/api/employees/${emp._id}/status`)
        .send({ status: 'On Leave' });

      expect(leaveRes.status).toBe(200);
      expect(leaveRes.body.data.employmentStatus).toBe('On Leave');

      // Update to Inactive
      const inactiveRes = await request(app)
        .patch(`/api/employees/${emp._id}/status`)
        .send({ status: 'Inactive' });

      expect(inactiveRes.status).toBe(200);
      expect(inactiveRes.body.data.employmentStatus).toBe('Inactive');
    });

    test('should reject invalid employment status', async () => {
      const emp = await Employee.create({
        employeeId: 'EMP-402',
        fullName: 'Test Employee',
        phone: '+8801811111111',
        staffType: 'Administrative',
        designation: 'Officer',
        department: 'Administration',
      });

      const res = await request(app)
        .patch(`/api/employees/${emp._id}/status`)
        .send({ status: 'UnknownStatus' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 6. Referential Integrity & Deletion ────────────────────────────────────
  describe('DELETE /api/employees/:id — Deletion & Referential Integrity', () => {
    test('should prevent deletion of employee with active field assignments', async () => {
      const officer = await Employee.create({
        employeeId: 'FO-999',
        fullName: 'Active Officer',
        phone: '+8801999999999',
        staffType: 'Field Staff',
        designation: 'Field Officer',
        department: 'Field Operations',
        isFieldOfficer: true,
      });

      const member = await Member.create({
        memberId: 'MEM-999',
        fullName: 'Assigned Member',
        phone: '+8801888888888',
        address: 'Uttara, Dhaka',
      });

      await FieldOfficerAssignment.create({
        fieldOfficer: officer._id,
        member: member._id,
        status: 'Active',
      });

      // Attempt deletion
      const deleteRes = await request(app).delete(`/api/employees/${officer._id}`);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.message).toMatch(/active field officer assignment/i);

      // Verify officer is NOT deleted
      const stillExists = await Employee.findById(officer._id);
      expect(stillExists).not.toBeNull();
    });

    test('should delete employee successfully if no active assignments exist', async () => {
      const emp = await Employee.create({
        employeeId: 'EMP-501',
        fullName: 'Unassigned Staff',
        phone: '+8801777777777',
        staffType: 'Administrative',
        designation: 'Assistant',
        department: 'Administration',
      });

      const deleteRes = await request(app).delete(`/api/employees/${emp._id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const check = await Employee.findById(emp._id);
      expect(check).toBeNull();
    });
  });
});
