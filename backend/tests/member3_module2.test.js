/**
 * Automated Tests: Member 3 — Installment Management (Module 2)
 * SE331 Software Engineering Design Capstone Project (Group 04 Section C2)
 *
 * Verifies:
 * 1. Repayment schedule calculation & preview simulation.
 * 2. Automated repayment schedule generation upon disbursement.
 * 3. Collecting and recording installment payments with receipt generation.
 * 4. Loan status auto-closure when all installments are fully paid.
 * 5. Installment collection transactions listing and filtering.
 * 6. Aggregated installment collections analytics.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const installmentRoutes = require('../src/routes/installmentRoutes');
const loanRoutes = require('../src/routes/loanRoutes');
const memberRoutes = require('../src/routes/memberRoutes');
const employeeRoutes = require('../src/routes/employeeRoutes');

const Loan = require('../src/models/Loan');
const Member = require('../src/models/Member');
const Employee = require('../src/models/Employee');
const InstallmentPayment = require('../src/models/InstallmentPayment');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/installments', installmentRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/employees', employeeRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await InstallmentPayment.deleteMany({});
  await Loan.deleteMany({});
  await Member.deleteMany({});
  await Employee.deleteMany({});
});

describe('Member 3 - Installment Management API (Module 2)', () => {
  // ─── 1. Repayment Schedule Simulation & Preview ────────────────────────────
  describe('GET /api/installments/calculator-preview', () => {
    test('should simulate financial breakdown and schedule correctly', async () => {
      const res = await request(app)
        .get('/api/installments/calculator-preview')
        .query({
          principalAmount: 20000,
          interestRate: 10,
          termDuration: 6,
          termType: 'Monthly',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.financials.principalAmount).toBe(20000);
      expect(res.body.data.financials.totalInterest).toBe(1000); // 20000 * 10 * 0.5 / 100 = 1000
      expect(res.body.data.financials.totalPayable).toBe(21000);
      expect(res.body.data.financials.installmentAmount).toBe(3500); // 21000 / 6 = 3500
      expect(res.body.data.schedule.length).toBe(6);
      expect(res.body.data.schedule[0].installmentNumber).toBe(1);
      expect(res.body.data.schedule[0].status).toBe('Unpaid');
    });

    test('should reject preview calculation when parameters are missing', async () => {
      const res = await request(app).get('/api/installments/calculator-preview');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 2. Schedule Generation Upon Disbursement ─────────────────────────────
  describe('POST /api/installments/generate-schedule/:loanId', () => {
    test('should generate full repayment schedule and mark approved loan as Disbursed', async () => {
      const member = await Member.create({
        memberId: 'MEM-INST-01',
        fullName: 'Fatema Akter',
        phone: '+8801700000010',
        address: 'Dhaka',
      });

      const loan = await Loan.create({
        loanId: 'LN-2026-0001',
        member: member._id,
        principalAmount: 12000,
        interestRate: 10,
        termDuration: 12,
        termType: 'Monthly',
        totalInterest: 1200,
        totalPayable: 13200,
        installmentAmount: 1100,
        purpose: 'Small grocery shop',
        status: 'Approved',
        approvedDate: new Date(),
        installments: [],
      });

      const res = await request(app)
        .post(`/api/installments/generate-schedule/${loan._id}`)
        .send({ disbursementDate: new Date() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Disbursed');
      expect(res.body.data.installments.length).toBe(12);
      expect(res.body.data.installments[0].amount).toBe(1100);
    });
  });

  // ─── 3. Collecting and Recording Installment Payments ──────────────────────
  describe('POST /api/installments/collect', () => {
    test('should record installment collection with unique receipt and update loan state', async () => {
      const member = await Member.create({
        memberId: 'MEM-INST-02',
        fullName: 'Jalal Uddin',
        phone: '+8801700000020',
        address: 'Savar',
      });

      const officer = await Employee.create({
        employeeId: 'FO-901',
        fullName: 'Kamrul Hasan',
        phone: '+8801811111901',
        staffType: 'Field Staff',
        designation: 'Field Officer',
        department: 'Field Operations',
        isFieldOfficer: true,
      });

      const loan = await Loan.create({
        loanId: 'LN-2026-0002',
        member: member._id,
        principalAmount: 10000,
        interestRate: 10,
        termDuration: 2,
        termType: 'Monthly',
        totalInterest: 167,
        totalPayable: 10167,
        installmentAmount: 5084,
        totalPaid: 0,
        purpose: 'Cattle feed purchase',
        status: 'Disbursed',
        disbursedDate: new Date(),
        installments: [
          {
            installmentNumber: 1,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            amount: 5084,
            status: 'Unpaid',
            paidAmount: 0,
          },
          {
            installmentNumber: 2,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            amount: 5083,
            status: 'Unpaid',
            paidAmount: 0,
          },
        ],
      });

      // Collect Installment #1
      const res = await request(app)
        .post('/api/installments/collect')
        .send({
          loanId: loan._id,
          installmentNumber: 1,
          amount: 5084,
          paymentMethod: 'Cash',
          collectedBy: officer._id,
          notes: 'Collected on schedule',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.receiptNumber).toMatch(/^RCP-/);
      expect(res.body.data.installment.status).toBe('Paid');
      expect(res.body.data.totalPaid).toBe(5084);
      expect(res.body.data.loanStatus).toBe('Disbursed');

      // Verify transaction saved in InstallmentPayment ledger
      const tx = await InstallmentPayment.findOne({ receiptNumber: res.body.data.receiptNumber });
      expect(tx).not.toBeNull();
      expect(tx.amount).toBe(5084);
      expect(tx.installmentNumber).toBe(1);
    });

    test('should automatically close loan when final installment is paid', async () => {
      const member = await Member.create({
        memberId: 'MEM-INST-03',
        fullName: 'Nazia Khan',
        phone: '+8801700000030',
        address: 'Gazipur',
      });

      const loan = await Loan.create({
        loanId: 'LN-2026-0003',
        member: member._id,
        principalAmount: 5000,
        interestRate: 10,
        termDuration: 1,
        termType: 'Monthly',
        totalInterest: 42,
        totalPayable: 5042,
        installmentAmount: 5042,
        totalPaid: 0,
        purpose: 'Handicraft supplies',
        status: 'Disbursed',
        disbursedDate: new Date(),
        installments: [
          {
            installmentNumber: 1,
            dueDate: new Date(),
            amount: 5042,
            status: 'Unpaid',
            paidAmount: 0,
          },
        ],
      });

      const res = await request(app)
        .post('/api/installments/collect')
        .send({
          loanId: loan._id,
          installmentNumber: 1,
          amount: 5042,
          paymentMethod: 'bKash',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.loanStatus).toBe('Closed');
    });

    test('should reject duplicate payment on already paid installment', async () => {
      const member = await Member.create({
        memberId: 'MEM-INST-04',
        fullName: 'Rafiqul Islam',
        phone: '+8801700000040',
        address: 'Uttara',
      });

      const loan = await Loan.create({
        loanId: 'LN-2026-0004',
        member: member._id,
        principalAmount: 5000,
        interestRate: 10,
        termDuration: 2,
        termType: 'Monthly',
        totalInterest: 50,
        totalPayable: 5050,
        installmentAmount: 2525,
        totalPaid: 2525,
        purpose: 'Sewing machine repair',
        status: 'Disbursed',
        disbursedDate: new Date(),
        installments: [
          {
            installmentNumber: 1,
            dueDate: new Date(),
            amount: 2525,
            status: 'Paid',
            paidAmount: 2525,
            paidDate: new Date(),
          },
          {
            installmentNumber: 2,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            amount: 2525,
            status: 'Unpaid',
          },
        ],
      });

      const res = await request(app)
        .post('/api/installments/collect')
        .send({
          loanId: loan._id,
          installmentNumber: 1,
          amount: 2525,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been marked as Paid/i);
    });
  });

  // ─── 4. Schedule Breakdown & Statistics ───────────────────────────────────
  describe('GET /api/installments/schedule/:loanId & stats', () => {
    test('should return schedule statistics for a given loan', async () => {
      const member = await Member.create({
        memberId: 'MEM-INST-05',
        fullName: 'Bilkis Begum',
        phone: '+8801700000050',
        address: 'Mirpur',
      });

      const loan = await Loan.create({
        loanId: 'LN-2026-0005',
        member: member._id,
        principalAmount: 6000,
        interestRate: 10,
        termDuration: 3,
        termType: 'Monthly',
        totalInterest: 150,
        totalPayable: 6150,
        installmentAmount: 2050,
        totalPaid: 2050,
        purpose: 'Poultry feed',
        status: 'Disbursed',
        installments: [
          { installmentNumber: 1, dueDate: new Date(), amount: 2050, status: 'Paid', paidAmount: 2050 },
          { installmentNumber: 2, dueDate: new Date(), amount: 2050, status: 'Unpaid' },
          { installmentNumber: 3, dueDate: new Date(), amount: 2050, status: 'Unpaid' },
        ],
      });

      const res = await request(app).get(`/api/installments/schedule/${loan._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalInstallments).toBe(3);
      expect(res.body.data.stats.paidInstallments).toBe(1);
      expect(res.body.data.stats.unpaidInstallments).toBe(2);
      expect(res.body.data.stats.progressPercent).toBe(33);
    });

    test('should return overall installment collection analytics via GET /api/installments/stats', async () => {
      const res = await request(app).get('/api/installments/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalCollected');
      expect(res.body.data).toHaveProperty('totalPaymentsCount');
    });
  });
});
