/**
 * Member 2 — Module 2 Integration Tests (SE331 Group 04 Section C2)
 * Tests for Loan Management and Due & Overdue Detection Engine.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const Member = require('../src/models/Member');
const Loan = require('../src/models/Loan');
const loanRoutes = require('../src/routes/loanRoutes');
const dueOverdueRoutes = require('../src/routes/dueOverdueRoutes');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/loans', loanRoutes);
  app.use('/api/due-overdue', dueOverdueRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await Loan.deleteMany({});
});

const createTestMember = async (overrides = {}) => {
  return Member.create({
    memberId: 'MEM-L01',
    fullName: 'Kamal Hossain',
    phone: '+8801811223344',
    address: 'Mirpur, Dhaka',
    status: 'Active',
    ...overrides,
  });
};

describe('Member 2 - Module 2: Credit & Field Operations API', () => {
  // ─── Loan Application Tests ──────────────────────────────────────────────────
  describe('POST /api/loans', () => {
    test('should submit a valid loan application with calculated financials', async () => {
      const member = await createTestMember();

      const res = await request(app)
        .post('/api/loans')
        .send({
          member: member._id.toString(),
          principalAmount: 20000,
          interestRate: 10,
          termDuration: 12,
          termType: 'Monthly',
          purpose: 'Small business expansion',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.loanId).toMatch(/^LN-/);
      expect(res.body.data.principalAmount).toBe(20000);
      expect(res.body.data.interestRate).toBe(10);
      expect(res.body.data.totalInterest).toBe(2000); // 20000 * 10% * 1 year = 2000
      expect(res.body.data.totalPayable).toBe(22000);
      expect(res.body.data.status).toBe('Pending');
    });

    test('should reject loan application with principal below minimum', async () => {
      const member = await createTestMember();

      const res = await request(app)
        .post('/api/loans')
        .send({
          member: member._id.toString(),
          principalAmount: 500, // below 1000 limit
          interestRate: 10,
          termDuration: 6,
          purpose: 'Emergency',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Loan Status Workflow Tests ──────────────────────────────────────────────
  describe('PATCH /api/loans/:id/status', () => {
    test('should approve a pending loan', async () => {
      const member = await createTestMember();
      const loan = await Loan.create({
        loanId: 'LN-TEST-1',
        member: member._id,
        principalAmount: 10000,
        interestRate: 10,
        termDuration: 6,
        termType: 'Monthly',
        totalInterest: 500,
        totalPayable: 10500,
        installmentAmount: 1750,
        purpose: 'Agriculture',
        status: 'Pending',
      });

      const res = await request(app)
        .patch(`/api/loans/${loan._id}/status`)
        .send({ status: 'Approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.approvedDate).toBeTruthy();
    });

    test('should disburse an approved loan and generate installment schedule', async () => {
      const member = await createTestMember();
      const loan = await Loan.create({
        loanId: 'LN-TEST-2',
        member: member._id,
        principalAmount: 12000,
        interestRate: 10,
        termDuration: 6,
        termType: 'Monthly',
        totalInterest: 600,
        totalPayable: 12600,
        installmentAmount: 2100,
        purpose: 'Livestock',
        status: 'Approved',
      });

      const res = await request(app)
        .patch(`/api/loans/${loan._id}/status`)
        .send({ status: 'Disbursed' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Disbursed');
      expect(res.body.data.disbursedDate).toBeTruthy();
      expect(res.body.data.installments.length).toBe(6);
      expect(res.body.data.installments[0].status).toBe('Unpaid');
      expect(res.body.data.installments[0].amount).toBe(2100);
    });

    test('should reject disburse on a Pending (unapproved) loan', async () => {
      const member = await createTestMember();
      const loan = await Loan.create({
        loanId: 'LN-TEST-3',
        member: member._id,
        principalAmount: 10000,
        interestRate: 10,
        termDuration: 6,
        totalInterest: 500,
        totalPayable: 10500,
        installmentAmount: 1750,
        purpose: 'Education',
        status: 'Pending',
      });

      const res = await request(app)
        .patch(`/api/loans/${loan._id}/status`)
        .send({ status: 'Disbursed' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/must be Approved before Disbursement/i);
    });
  });

  // ─── Installment Payment Tests ───────────────────────────────────────────────
  describe('POST /api/loans/:id/installments/:installmentNumber/pay', () => {
    test('should record an installment payment and update total paid', async () => {
      const member = await createTestMember();
      const loan = await Loan.create({
        loanId: 'LN-TEST-4',
        member: member._id,
        principalAmount: 10000,
        interestRate: 10,
        termDuration: 2,
        termType: 'Monthly',
        totalInterest: 500,
        totalPayable: 10500,
        installmentAmount: 5250,
        purpose: 'Shop',
        status: 'Disbursed',
        installments: [
          { installmentNumber: 1, dueDate: new Date(), amount: 5250, status: 'Unpaid' },
          { installmentNumber: 2, dueDate: new Date(Date.now() + 30 * 86400000), amount: 5250, status: 'Unpaid' },
        ],
      });

      const res = await request(app)
        .post(`/api/loans/${loan._id}/installments/1/pay`)
        .send({ amount: 5250 });

      expect(res.status).toBe(200);
      expect(res.body.data.totalPaid).toBe(5250);
      expect(res.body.data.installments[0].status).toBe('Paid');
      expect(res.body.data.installments[0].paidAmount).toBe(5250);
    });
  });

  // ─── Due & Overdue Detection Engine Tests ────────────────────────────────────
  describe('GET /api/due-overdue/defaulters', () => {
    test('should compile real-time defaulters list for past-due installments', async () => {
      const member = await createTestMember({ fullName: 'Rashedul Islam', memberId: 'MEM-DEF-01' });

      // Create a loan with an overdue installment (due 20 days ago)
      const pastDueDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);

      await Loan.create({
        loanId: 'LN-DEF-1',
        member: member._id,
        principalAmount: 20000,
        interestRate: 12,
        termDuration: 4,
        termType: 'Monthly',
        totalInterest: 800,
        totalPayable: 20800,
        installmentAmount: 5200,
        purpose: 'Handicrafts',
        status: 'Disbursed',
        installments: [
          { installmentNumber: 1, dueDate: pastDueDate, amount: 5200, status: 'Unpaid' },
          { installmentNumber: 2, dueDate: new Date(Date.now() + 10 * 86400000), amount: 5200, status: 'Unpaid' },
        ],
      });

      const res = await request(app).get('/api/due-overdue/defaulters');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].member.fullName).toBe('Rashedul Islam');
      expect(res.body.data[0].totalOverdueAmount).toBe(5200);
      expect(res.body.data[0].maxDaysOverdue).toBeGreaterThanOrEqual(19);
      expect(res.body.data[0].riskLevel).toBe('Moderate'); // 16-30 days
    });

    test('should return summary analytics with overdue metrics', async () => {
      const res = await request(app).get('/api/due-overdue/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalOverdueAmount');
      expect(res.body.data).toHaveProperty('defaulterCount');
    });
  });
});
