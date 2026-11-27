const express = require('express');
const router = express.Router();
const {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
  getReceiptStats,
} = require('../controllers/receiptController');

router.get('/', getReceipts);
router.get('/stats', getReceiptStats);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;
