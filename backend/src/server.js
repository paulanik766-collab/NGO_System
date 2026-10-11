/**
 * Express Server — NGO Management System (SE331 Group 04 Section C2)
 * Entry point for the backend API.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ─── Route imports ──────────────────────────────────────────────────────────────
const memberRoutes = require('./routes/memberRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ─── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NGO Management System API is running', timestamp: new Date() });
});

// ─── API Routes ─────────────────────────────────────────────────────────────────
// Member 1: Member Management
app.use('/api/members', memberRoutes);

// Member 1: Field Officer Assignments & field officer listing
app.use('/api', assignmentRoutes);

// Member 3 scaffold: Employee Management
app.use('/api/employees', employeeRoutes);

// Member 2: Member Verification
app.use('/api/verifications', verificationRoutes);

// ─── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// ─── Start server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`NGO Management API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app; // Export for testing
