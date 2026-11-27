/**
 * Loan Routes (SE331 Group 04 Section C2 — Member 2)
 * Endpoints for loan application, status workflow, and installment payments.
 */
const express = require('express');
const router = express.Router();
const {
  getLoans,
  getLoanById,
  createLoan,
  updateLoanStatus,
  recordInstallmentPayment,
  deleteLoan,
} = require('../controllers/loanController');

router.route('/')
  .get(getLoans)
  .post(createLoan);

router.route('/:id')
  .get(getLoanById)
  .delete(deleteLoan);

router.patch('/:id/status', updateLoanStatus);

router.post('/:id/installments/:installmentNumber/pay', recordInstallmentPayment);

module.exports = router;
