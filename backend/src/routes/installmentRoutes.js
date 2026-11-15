/**
 * Installment Routes — Member 3 (Module 2: Installment Management)
 * SE331 Software Engineering Design Capstone Project (Group 04 Section C2)
 *
 * Endpoints for:
 * 1. Schedule simulation & automated schedule generation upon disbursement
 * 2. Installment collection & payment recording with receipts
 * 3. Schedule inspection, payments ledger, and collection analytics
 */
const express = require('express');
const router = express.Router();
const {
  previewRepaymentSchedule,
  generateScheduleForLoan,
  collectInstallmentPayment,
  getLoanSchedule,
  getAllPayments,
  getInstallmentStats,
} = require('../controllers/installmentController');

// GET /api/installments/calculator-preview — Simulate schedule
router.get('/calculator-preview', previewRepaymentSchedule);

// GET /api/installments/stats — Collection analytics
router.get('/stats', getInstallmentStats);

// GET /api/installments/payments — All collection ledger transactions
router.get('/payments', getAllPayments);

// GET /api/installments/schedule/:loanId — View detailed schedule for a loan
router.get('/schedule/:loanId', getLoanSchedule);

// POST /api/installments/generate-schedule/:loanId — Auto-generate/disburse schedule
router.post('/generate-schedule/:loanId', generateScheduleForLoan);

// POST /api/installments/collect — Record an installment payment
router.post('/collect', collectInstallmentPayment);

module.exports = router;
