/**
 * Member Routes — Member 1 (SE331 Group 04 Section C2)
 */
const express = require('express');
const router = express.Router();
const {
  getMembers,
  createMember,
  getMemberById,
  updateMember,
  toggleMemberStatus,
  deleteMember,
} = require('../controllers/memberController');

// GET    /api/members          — List all (with search & filter)
// POST   /api/members          — Register new member
router.route('/').get(getMembers).post(createMember);

// GET    /api/members/:id      — View member profile
// PUT    /api/members/:id      — Update member
// DELETE /api/members/:id      — Delete member
router.route('/:id').get(getMemberById).put(updateMember).delete(deleteMember);

// PATCH  /api/members/:id/status  — Toggle Active/Inactive
router.patch('/:id/status', toggleMemberStatus);

module.exports = router;
