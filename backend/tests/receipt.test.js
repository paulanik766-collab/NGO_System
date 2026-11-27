const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

const memberRoutes = require('../src/routes/memberRoutes');
const receiptRoutes = require('../src/routes/receiptRoutes');
const Member = require('../src/models/Member');
const Receipt = require('../src/models/Receipt');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/members', memberRoutes);
  app.use('/api/receipts', receiptRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await Receipt.deleteMany({});
});

describe('Member 1 (Module 3) - Receipt Generation API', () => {
  const createMember = async () => {
    return Member.create({
      memberId: 'MEM-001',
      fullName: 'Amina Khatun',
      phone: '+8801712345678',
      address: 'Mirpur, Dhaka',
    });
  };

  test('POST /api/receipts should generate a new payment receipt', async () => {
    const member = await createMember();

    const res = await request(app)
      .post('/api/receipts')
      .send({
        member: member._id,
        receiptNumber: 'REC-1001',
        collectionType: 'Savings Deposit',
        amount: 500,
        paymentMethod: 'Cash',
        collectedBy: 'Field Officer',
        remarks: 'Weekly installment collection',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.receiptNumber).toBe('REC-1001');
    expect(res.body.data.amount).toBe(500);
    expect(res.body.data.member.fullName).toBe('Amina Khatun');
  });

  test('POST /api/receipts should reject duplicate receipt number', async () => {
    const member = await createMember();

    await request(app)
      .post('/api/receipts')
      .send({
        member: member._id,
        receiptNumber: 'REC-1001',
        amount: 500,
      });

    const res = await request(app)
      .post('/api/receipts')
      .send({
        member: member._id,
        receiptNumber: 'REC-1001',
        amount: 300,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/receipts should return receipts with search filter', async () => {
    const member = await createMember();

    await Receipt.create({
      receiptNumber: 'REC-1001',
      member: member._id,
      collectionType: 'Savings Deposit',
      amount: 500,
    });

    const res = await request(app).get('/api/receipts?search=REC-1001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].receiptNumber).toBe('REC-1001');
  });

  test('GET /api/receipts/stats should return aggregated receipt stats', async () => {
    const member = await createMember();

    await Receipt.create([
      {
        receiptNumber: 'REC-1',
        member: member._id,
        collectionType: 'Savings Deposit',
        amount: 500,
        paymentMethod: 'Cash',
      },
      {
        receiptNumber: 'REC-2',
        member: member._id,
        collectionType: 'Loan Installment',
        amount: 1500,
        paymentMethod: 'bKash',
      },
    ]);

    const res = await request(app).get('/api/receipts/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReceipts).toBe(2);
    expect(res.body.data.totalAmount).toBe(2000);
    expect(res.body.data.cashTotal).toBe(500);
    expect(res.body.data.digitalTotal).toBe(1500);
  });

  test('DELETE /api/receipts/:id should delete receipt', async () => {
    const member = await createMember();
    const receipt = await Receipt.create({
      receiptNumber: 'REC-DEL',
      member: member._id,
      amount: 400,
    });

    const res = await request(app).delete(`/api/receipts/${receipt._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await Receipt.findById(receipt._id);
    expect(check).toBeNull();
  });
});
