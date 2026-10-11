const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const memberRoutes = require('../src/routes/memberRoutes');
const assignmentRoutes = require('../src/routes/assignmentRoutes');
const employeeRoutes = require('../src/routes/employeeRoutes');
const Member = require('../src/models/Member');
const Employee = require('../src/models/Employee');
const FieldOfficerAssignment = require('../src/models/FieldOfficerAssignment');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/members', memberRoutes);
  app.use('/api', assignmentRoutes);
  app.use('/api/employees', employeeRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await Employee.deleteMany({});
  await FieldOfficerAssignment.deleteMany({});
});

describe('Member 1 - Member Management API', () => {
  test('POST /api/members should register a new member', async () => {
    const res = await request(app)
      .post('/api/members')
      .send({
        memberId: 'MEM-001',
        fullName: 'Amina Khatun',
        phone: '+8801712345678',
        email: 'amina@example.com',
        address: 'Mirpur-10, Dhaka',
        joinDate: '2026-01-15',
        status: 'Active',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Amina Khatun');
    expect(res.body.data.memberId).toBe('MEM-001');
  });

  test('POST /api/members should reject duplicate memberId', async () => {
    await Member.create({
      memberId: 'MEM-001',
      fullName: 'Amina Khatun',
      phone: '+8801712345678',
      address: 'Mirpur-10, Dhaka',
    });

    const res = await request(app)
      .post('/api/members')
      .send({
        memberId: 'MEM-001',
        fullName: 'Another Member',
        phone: '+8801799999999',
        address: 'Dhanmondi, Dhaka',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/members should support text search and filter by status', async () => {
    await Member.create([
      { memberId: 'MEM-101', fullName: 'Karim Ullah', phone: '+8801711111111', address: 'Gazipur', status: 'Active' },
      { memberId: 'MEM-102', fullName: 'Fatima Begum', phone: '+8801722222222', address: 'Savar', status: 'Inactive' },
    ]);

    // Search by name
    const searchRes = await request(app).get('/api/members?search=Karim');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBe(1);
    expect(searchRes.body.data[0].memberId).toBe('MEM-101');

    // Filter by status
    const statusRes = await request(app).get('/api/members?status=Inactive');
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.length).toBe(1);
    expect(statusRes.body.data[0].memberId).toBe('MEM-102');
  });

  test('PATCH /api/members/:id/status should toggle member active/inactive status', async () => {
    const member = await Member.create({
      memberId: 'MEM-201',
      fullName: 'Tariq Hasan',
      phone: '+8801733333333',
      address: 'Uttara, Dhaka',
      status: 'Active',
    });

    const toggle1 = await request(app).patch(`/api/members/${member._id}/status`);
    expect(toggle1.status).toBe(200);
    expect(toggle1.body.data.status).toBe('Inactive');

    const toggle2 = await request(app).patch(`/api/members/${member._id}/status`);
    expect(toggle2.status).toBe(200);
    expect(toggle2.body.data.status).toBe('Active');
  });
});

describe('Member 1 - Field Officer Assignment API', () => {
  let officer;
  let member;

  beforeEach(async () => {
    officer = await Employee.create({
      employeeId: 'EMP-FO-01',
      fullName: 'Rahim Field Officer',
      phone: '+8801811112222',
      designation: 'Senior Field Officer',
      isFieldOfficer: true,
      employmentStatus: 'Active',
    });

    member = await Member.create({
      memberId: 'MEM-301',
      fullName: 'Rokeya Sultana',
      phone: '+8801744445555',
      address: 'Keraniganj, Dhaka',
      status: 'Active',
    });
  });

  test('POST /api/assignments should assign a field officer to a member', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .send({
        fieldOfficer: officer._id,
        member: member._id,
        notes: 'Microcredit group supervision',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fieldOfficer.employeeId).toBe('EMP-FO-01');
    expect(res.body.data.member.memberId).toBe('MEM-301');
  });

  test('POST /api/assignments should assign a field officer to a collection group', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .send({
        fieldOfficer: officer._id,
        collectionGroup: 'Group Padma - Sector 4',
        notes: 'Weekly savings collection',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.collectionGroup).toBe('Group Padma - Sector 4');
  });

  test('POST /api/assignments should prevent duplicate active assignment for same officer and member', async () => {
    await FieldOfficerAssignment.create({
      fieldOfficer: officer._id,
      member: member._id,
      status: 'Active',
    });

    const res = await request(app)
      .post('/api/assignments')
      .send({
        fieldOfficer: officer._id,
        member: member._id,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /api/assignments/:id should mark assignment as Removed', async () => {
    const assignment = await FieldOfficerAssignment.create({
      fieldOfficer: officer._id,
      member: member._id,
      status: 'Active',
    });

    const res = await request(app).delete(`/api/assignments/${assignment._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Removed');
  });
});
