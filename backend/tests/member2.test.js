/**
 * Member 2 — Verification API Tests (SE331 Group 04 Section C2)
 * Integration tests for document upload, status updates, and CRUD operations.
 * Uses mongodb-memory-server for an isolated in-memory database.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

const verificationRoutes = require('../src/routes/verificationRoutes');
const memberRoutes = require('../src/routes/memberRoutes');
const Member = require('../src/models/Member');
const Verification = require('../src/models/Verification');

let mongoServer;
let app;

// Ensure uploads directory exists for tests
const uploadsDir = path.join(__dirname, '../uploads/documents');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app = express();
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use('/api/members', memberRoutes);
  app.use('/api/verifications', verificationRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  // Clean up any test-uploaded files
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach((file) => {
      if (file !== '.gitkeep') {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    });
  }
});

beforeEach(async () => {
  await Member.deleteMany({});
  await Verification.deleteMany({});
});

// ─── Helper: Create a test member ──────────────────────────────────────────────
const createTestMember = async (overrides = {}) => {
  return Member.create({
    memberId: 'MEM-V01',
    fullName: 'Nasreen Akter',
    phone: '+8801755551234',
    address: 'Dhanmondi, Dhaka',
    status: 'Active',
    ...overrides,
  });
};

// ─── Helper: Create a small test file buffer ────────────────────────────────────
const createTestFilePath = () => {
  const testFilePath = path.join(uploadsDir, 'test-file.jpg');
  // Create a minimal JPEG-like file (just bytes for testing, not a real image)
  fs.writeFileSync(testFilePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]));
  return testFilePath;
};

describe('Member 2 - Verification API', () => {
  // ─── Upload Tests ──────────────────────────────────────────────────────────────
  describe('POST /api/verifications/upload', () => {
    test('should upload a document for a valid member', async () => {
      const member = await createTestMember();
      const testFile = createTestFilePath();

      const res = await request(app)
        .post('/api/verifications/upload')
        .field('member', member._id.toString())
        .field('documentType', 'NID')
        .attach('document', testFile);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documentType).toBe('NID');
      expect(res.body.data.verificationStatus).toBe('Pending');
      expect(res.body.data.member.fullName).toBe('Nasreen Akter');
      expect(res.body.data.documentPath).toMatch(/uploads\/documents\//);
    });

    test('should reject upload for non-existent member', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const testFile = createTestFilePath();

      const res = await request(app)
        .post('/api/verifications/upload')
        .field('member', fakeId.toString())
        .field('documentType', 'NID')
        .attach('document', testFile);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Member not found/i);
    });

    test('should reject upload without a file', async () => {
      const member = await createTestMember();

      const res = await request(app)
        .post('/api/verifications/upload')
        .field('member', member._id.toString())
        .field('documentType', 'NID');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/file is required/i);
    });

    test('should reject upload with invalid document type', async () => {
      const member = await createTestMember();
      const testFile = createTestFilePath();

      const res = await request(app)
        .post('/api/verifications/upload')
        .field('member', member._id.toString())
        .field('documentType', 'Passport')
        .attach('document', testFile);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── List & Filter Tests ───────────────────────────────────────────────────────
  describe('GET /api/verifications', () => {
    test('should list all verification records with filters', async () => {
      const member = await createTestMember();

      await Verification.create([
        {
          member: member._id,
          documentType: 'NID',
          documentPath: 'uploads/documents/test-nid.jpg',
          originalFileName: 'nid.jpg',
          verificationStatus: 'Pending',
        },
        {
          member: member._id,
          documentType: 'Photo',
          documentPath: 'uploads/documents/test-photo.jpg',
          originalFileName: 'photo.jpg',
          verificationStatus: 'Verified',
        },
      ]);

      // Get all
      const allRes = await request(app).get('/api/verifications');
      expect(allRes.status).toBe(200);
      expect(allRes.body.data.length).toBe(2);

      // Filter by status
      const pendingRes = await request(app).get('/api/verifications?status=Pending');
      expect(pendingRes.body.data.length).toBe(1);
      expect(pendingRes.body.data[0].documentType).toBe('NID');

      // Filter by document type
      const photoRes = await request(app).get('/api/verifications?documentType=Photo');
      expect(photoRes.body.data.length).toBe(1);
      expect(photoRes.body.data[0].verificationStatus).toBe('Verified');
    });
  });

  // ─── Get by Member Tests ──────────────────────────────────────────────────────
  describe('GET /api/verifications/member/:memberId', () => {
    test('should get all documents for a specific member', async () => {
      const member = await createTestMember();

      await Verification.create([
        {
          member: member._id,
          documentType: 'NID',
          documentPath: 'uploads/documents/test-nid.jpg',
          verificationStatus: 'Pending',
        },
        {
          member: member._id,
          documentType: 'Photo',
          documentPath: 'uploads/documents/test-photo.jpg',
          verificationStatus: 'Pending',
        },
      ]);

      const res = await request(app).get(`/api/verifications/member/${member._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.member.fullName).toBe('Nasreen Akter');
    });

    test('should return 404 for non-existent member', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/verifications/member/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── Status Update Tests ──────────────────────────────────────────────────────
  describe('PATCH /api/verifications/:id/status', () => {
    test('should update status from Pending to Verified', async () => {
      const member = await createTestMember();
      const verification = await Verification.create({
        member: member._id,
        documentType: 'NID',
        documentPath: 'uploads/documents/test-nid.jpg',
        verificationStatus: 'Pending',
      });

      const res = await request(app)
        .patch(`/api/verifications/${verification._id}/status`)
        .send({ status: 'Verified' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('Verified');
      expect(res.body.data.reviewedAt).toBeTruthy();
    });

    test('should update status to Rejected with remarks', async () => {
      const member = await createTestMember();
      const verification = await Verification.create({
        member: member._id,
        documentType: 'Photo',
        documentPath: 'uploads/documents/test-photo.jpg',
        verificationStatus: 'Pending',
      });

      const res = await request(app)
        .patch(`/api/verifications/${verification._id}/status`)
        .send({ status: 'Rejected', remarks: 'Photo is blurred, please resubmit' });

      expect(res.status).toBe(200);
      expect(res.body.data.verificationStatus).toBe('Rejected');
      expect(res.body.data.remarks).toBe('Photo is blurred, please resubmit');
      expect(res.body.data.reviewedAt).toBeTruthy();
    });

    test('should reject invalid status value', async () => {
      const member = await createTestMember();
      const verification = await Verification.create({
        member: member._id,
        documentType: 'NID',
        documentPath: 'uploads/documents/test-nid.jpg',
        verificationStatus: 'Pending',
      });

      const res = await request(app)
        .patch(`/api/verifications/${verification._id}/status`)
        .send({ status: 'Approved' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Delete Tests ─────────────────────────────────────────────────────────────
  describe('DELETE /api/verifications/:id', () => {
    test('should delete a verification record', async () => {
      const member = await createTestMember();
      const verification = await Verification.create({
        member: member._id,
        documentType: 'NID',
        documentPath: 'uploads/documents/test-nid.jpg',
        verificationStatus: 'Pending',
      });

      const res = await request(app).delete(`/api/verifications/${verification._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm it's deleted from DB
      const found = await Verification.findById(verification._id);
      expect(found).toBeNull();
    });

    test('should return 404 for non-existent verification record', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/verifications/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});
