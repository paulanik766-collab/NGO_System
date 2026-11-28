const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const authRoutes = require('../src/routes/authRoutes');
const transactionRoutes = require('../src/routes/transactionRoutes');

const User = require('../src/models/User');
const Member = require('../src/models/Member');
const Transaction = require('../src/models/Transaction');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Member.deleteMany({});
  await Transaction.deleteMany({});
});

describe('Member 3 - User Authentication & Role Management (Module 3)', () => {
  test('should register a new user successfully with hashed password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jahurul Islam Prottoy',
        email: 'prottoy@ngo.org',
        password: 'password123',
        role: 'admin',
        phone: '01711223344',
        branch: 'Mirpur Branch',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Jahurul Islam Prottoy');
    expect(res.body.user.email).toBe('prottoy@ngo.org');
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.password).toBeUndefined();

    const dbUser = await User.findOne({ email: 'prottoy@ngo.org' }).select('+password');
    expect(dbUser).toBeDefined();
    expect(dbUser.password).not.toBe('password123');
  });

  test('should reject duplicate email during registration', async () => {
    await User.create({
      name: 'Existing User',
      email: 'duplicate@ngo.org',
      password: 'password123',
      role: 'field_officer',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'duplicate@ngo.org',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('should authenticate user and return token on valid login', async () => {
    await User.create({
      name: 'Manager User',
      email: 'manager@ngo.org',
      password: 'mypassword',
      role: 'manager',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@ngo.org',
        password: 'mypassword',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('manager');
  });

  test('should reject login with wrong password', async () => {
    await User.create({
      name: 'Test Staff',
      email: 'staff@ngo.org',
      password: 'correctpassword',
      role: 'field_officer',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'staff@ngo.org',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('should return authenticated user profile from /api/auth/me', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Accountant Staff',
        email: 'accountant@ngo.org',
        password: 'password123',
        role: 'accountant',
      });

    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe('accountant@ngo.org');
    expect(meRes.body.user.role).toBe('accountant');
  });

  test('should enforce role-based access control on admin endpoints', async () => {
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@ngo.org',
        password: 'password123',
        role: 'admin',
      });

    const officerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Officer User',
        email: 'officer@ngo.org',
        password: 'password123',
        role: 'field_officer',
      });

    const adminToken = adminRes.body.token;
    const officerToken = officerRes.body.token;

    const officerTryUpdateRole = await request(app)
      .put(`/api/auth/users/${officerRes.body.user._id}/role`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ role: 'manager' });

    expect(officerTryUpdateRole.status).toBe(403);

    const adminUpdateRole = await request(app)
      .put(`/api/auth/users/${officerRes.body.user._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'manager' });

    expect(adminUpdateRole.status).toBe(200);
    expect(adminUpdateRole.body.user.role).toBe('manager');
  });
});

describe('Member 3 - Unified Transaction Management API (Module 3)', () => {
  let sampleMember;

  beforeEach(async () => {
    sampleMember = await Member.create({
      fullName: 'Rahima Begum',
      memberId: 'MBR-9001',
      phone: '01811223344',
      email: 'rahima@example.com',
      address: 'House 12, Road 4, Mirpur',
      center: 'Center 01',
      status: 'Active',
    });
  });

  test('should create and record a financial transaction in unified ledger with unique transactionId', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'installment_payment',
        amount: 2500,
        memberId: sampleMember._id,
        paymentMethod: 'bKash',
        referenceId: 'RCP-202611-001',
        referenceModel: 'InstallmentPayment',
        performedBy: 'Field Officer Anik',
        remarks: 'Collected weekly installment',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.transactionId).toMatch(/^TRX-/);
    expect(res.body.transaction.type).toBe('installment_payment');
    expect(res.body.transaction.category).toBe('credit');
    expect(res.body.transaction.amount).toBe(2500);
    expect(res.body.transaction.paymentMethod).toBe('bKash');
    expect(res.body.transaction.member.fullName).toBe('Rahima Begum');
  });

  test('should fetch transactions list with pagination and search', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        type: 'installment_payment',
        amount: 1500,
        memberId: sampleMember._id,
        paymentMethod: 'Cash',
      });

    await request(app)
      .post('/api/transactions')
      .send({
        type: 'loan_disbursement',
        amount: 30000,
        memberId: sampleMember._id,
        paymentMethod: 'Bank Transfer',
      });

    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactions.length).toBe(2);

    const filterRes = await request(app)
      .get('/api/transactions')
      .query({ type: 'loan_disbursement' });
    expect(filterRes.status).toBe(200);
    expect(filterRes.body.transactions.length).toBe(1);
    expect(filterRes.body.transactions[0].type).toBe('loan_disbursement');
    expect(filterRes.body.transactions[0].category).toBe('debit');

    const searchRes = await request(app)
      .get('/api/transactions')
      .query({ search: 'Rahima' });
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.transactions.length).toBe(2);
  });

  test('should compute aggregated transaction statistics (inflow, outflow, net balance)', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        type: 'installment_payment',
        amount: 5000,
        memberId: sampleMember._id,
        paymentMethod: 'Cash',
      });

    await request(app)
      .post('/api/transactions')
      .send({
        type: 'savings_deposit',
        amount: 2000,
        memberId: sampleMember._id,
        paymentMethod: 'bKash',
      });

    await request(app)
      .post('/api/transactions')
      .send({
        type: 'loan_disbursement',
        amount: 4000,
        memberId: sampleMember._id,
        paymentMethod: 'Bank Transfer',
      });

    const statsRes = await request(app).get('/api/transactions/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.stats.totalInflow).toBe(7000);
    expect(statsRes.body.stats.totalOutflow).toBe(4000);
    expect(statsRes.body.stats.netBalance).toBe(3000);
    expect(statsRes.body.stats.totalTransactions).toBe(3);
  });

  test('should export flat transaction records for financial audit reports', async () => {
    await request(app)
      .post('/api/transactions')
      .send({
        type: 'savings_deposit',
        amount: 1000,
        memberId: sampleMember._id,
        paymentMethod: 'Cash',
      });

    const exportRes = await request(app).get('/api/transactions/export');
    expect(exportRes.status).toBe(200);
    expect(exportRes.body.success).toBe(true);
    expect(exportRes.body.data.length).toBe(1);
    expect(exportRes.body.data[0].memberName).toBe('Rahima Begum');
    expect(exportRes.body.data[0].amount).toBe(1000);
  });
});
