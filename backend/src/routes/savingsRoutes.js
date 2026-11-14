const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccountStatus,
  logTransaction,
  getLedger,
  getSavingsStats,
  getMemberSavings,
} = require('../controllers/savingsController');

router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.get('/accounts/:id', getAccountById);
router.patch('/accounts/:id/status', updateAccountStatus);

router.get('/ledger', getLedger);
router.post('/transactions', logTransaction);
router.get('/stats', getSavingsStats);
router.get('/member/:memberId', getMemberSavings);

module.exports = router;
