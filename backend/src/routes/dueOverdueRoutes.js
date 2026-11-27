/**
 * Due & Overdue Routes (SE331 Group 04 Section C2 — Member 2)
 * Endpoints for overdue detection analytics, defaulters list, and upcoming collections.
 */
const express = require('express');
const router = express.Router();
const {
  getDueAndOverdueSummary,
  getDefaultersList,
  getUpcomingDueInstallments,
} = require('../controllers/dueOverdueController');

router.get('/summary', getDueAndOverdueSummary);
router.get('/defaulters', getDefaultersList);
router.get('/upcoming', getUpcomingDueInstallments);

module.exports = router;
