const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const memberRoutes = require('../src/routes/memberRoutes');
const savingsRoutes = require('../src/routes/savingsRoutes');
const Member = require('../src/models/Member');
const SavingsAccount = require('../src/models/SavingsAccount');
const SavingsLedger = require('../src/models/SavingsLedger');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/members', memberRoutes);
  app.use('/api/savings', savingsRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await SavingsAccount.deleteMany({});
  await SavingsLedger.deleteMany({});
});

describe('Member 1 (Module 2) - Savings Management API', () => {
  const createTestMember = async () => {
    return Member.create({
      memberId: 'MEM-001',
      fullName: 'Amina Khatun',
      phone: '+8801712345678',
      address: 'Mirpur, Dhaka',
    });
  };

  test('POST /api/savings/accounts opens a new savings account with optional initial deposit', async () => {
    const member = await createTestMember();

    const res = await request(app)
      .post('/api/savings/accounts')
      .send({
        member: member._id,
        accountNumber: 'SAV-1001',
        accountType: 'General Savings',
        mandatoryAmount: 200,
        initialDeposit: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balance).toBe(500);
    expect(res.body.data.accountNumber).toBe('SAV-1001');

    const ledger = await SavingsLedger.find({ account: res.body.data._id });
    expect(ledger.length).toBe(1);
    expect(ledger[0].type).toBe('Deposit');
    expect(ledger[0].amount).toBe(500);
    expect(ledger[0].balanceAfter).toBe(500);
  });

  test('POST /api/savings/accounts rejects duplicate active account for the same member', async () => {
    const member = await createTestMember();

    await request(app)
      .post('/api/savings/accounts')
      .send({
        member: member._id,
        accountNumber: 'SAV-1001',
        initialDeposit: 100,
      });

    const res = await request(app)
      .post('/api/savings/accounts')
      .send({
        member: member._id,
        accountNumber: 'SAV-1002',
        initialDeposit: 200,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/savings/transactions logs mandatory deposit and updates balance in real-time', async () => {
    const member = await createTestMember();
    const account = await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 500,
    });

    const res = await request(app)
      .post('/api/savings/transactions')
      .send({
        accountId: account._id,
        type: 'Deposit',
        savingsType: 'Mandatory',
        amount: 300,
        paymentMethod: 'Cash',
        collectedBy: 'Rahim (Field Officer)',
        remarks: 'Weekly mandatory savings',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.newBalance).toBe(800);
    expect(res.body.data.transaction.balanceBefore).toBe(500);
    expect(res.body.data.transaction.balanceAfter).toBe(800);
    expect(res.body.data.transaction.savingsType).toBe('Mandatory');

    const updatedAccount = await SavingsAccount.findById(account._id);
    expect(updatedAccount.balance).toBe(800);
  });

  test('POST /api/savings/transactions logs voluntary deposit and updates balance', async () => {
    const member = await createTestMember();
    const account = await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 800,
    });

    const res = await request(app)
      .post('/api/savings/transactions')
      .send({
        accountId: account._id,
        type: 'Deposit',
        savingsType: 'Voluntary',
        amount: 250,
        paymentMethod: 'bKash',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.newBalance).toBe(1050);
  });

  test('POST /api/savings/transactions logs withdrawal and reduces balance in real-time', async () => {
    const member = await createTestMember();
    const account = await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 1000,
    });

    const res = await request(app)
      .post('/api/savings/transactions')
      .send({
        accountId: account._id,
        type: 'Withdrawal',
        savingsType: 'Voluntary',
        amount: 400,
        paymentMethod: 'Cash',
        remarks: 'Medical emergency',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.newBalance).toBe(600);
    expect(res.body.data.transaction.balanceBefore).toBe(1000);
    expect(res.body.data.transaction.balanceAfter).toBe(600);

    const updatedAccount = await SavingsAccount.findById(account._id);
    expect(updatedAccount.balance).toBe(600);
  });

  test('POST /api/savings/transactions rejects withdrawal if balance is insufficient', async () => {
    const member = await createTestMember();
    const account = await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 300,
    });

    const res = await request(app)
      .post('/api/savings/transactions')
      .send({
        accountId: account._id,
        type: 'Withdrawal',
        savingsType: 'Voluntary',
        amount: 500,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Insufficient balance/i);

    const intactAccount = await SavingsAccount.findById(account._id);
    expect(intactAccount.balance).toBe(300);
  });

  test('GET /api/savings/ledger returns transactions with accurate summary statistics', async () => {
    const member = await createTestMember();
    const account = await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 1100,
    });

    await SavingsLedger.create([
      {
        transactionId: 'TXN-1',
        account: account._id,
        member: member._id,
        type: 'Deposit',
        savingsType: 'Mandatory',
        amount: 500,
        balanceBefore: 0,
        balanceAfter: 500,
      },
      {
        transactionId: 'TXN-2',
        account: account._id,
        member: member._id,
        type: 'Deposit',
        savingsType: 'Voluntary',
        amount: 800,
        balanceBefore: 500,
        balanceAfter: 1300,
      },
      {
        transactionId: 'TXN-3',
        account: account._id,
        member: member._id,
        type: 'Withdrawal',
        savingsType: 'Voluntary',
        amount: 200,
        balanceBefore: 1300,
        balanceAfter: 1100,
      },
    ]);

    const res = await request(app).get('/api/savings/ledger');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.summary.totalDeposits).toBe(1300);
    expect(res.body.summary.totalWithdrawals).toBe(200);
    expect(res.body.summary.netSavings).toBe(1100);
    expect(res.body.summary.mandatoryDeposits).toBe(500);
    expect(res.body.summary.voluntaryDeposits).toBe(800);
  });

  test('GET /api/savings/stats calculates platform-wide savings summary', async () => {
    const member = await createTestMember();
    await SavingsAccount.create({
      accountNumber: 'SAV-1001',
      member: member._id,
      balance: 1500,
      status: 'Active',
    });

    const res = await request(app).get('/api/savings/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAccounts).toBe(1);
    expect(res.body.data.totalBalance).toBe(1500);
  });
});
