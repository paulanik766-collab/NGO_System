/**
 * Verification Routes — Member 2 (SE331 Group 04 Section C2)
 * Routes for document upload and verification status management.
 */
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getVerifications,
  getVerificationById,
  getVerificationsByMember,
  uploadDocument,
  updateVerificationStatus,
  deleteVerification,
} = require('../controllers/verificationController');

// GET    /api/verifications              — List all (with filters)
router.get('/', getVerifications);

// POST   /api/verifications/upload       — Upload document (multipart/form-data)
// Note: upload.single('document') must come before the controller
router.post('/upload', (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum file size is 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error.',
      });
    }
    next();
  });
}, uploadDocument);

// GET    /api/verifications/member/:memberId  — Documents for a specific member
// Note: This route must come before /:id to avoid route conflicts
router.get('/member/:memberId', getVerificationsByMember);

// GET    /api/verifications/:id          — Single verification record
// DELETE /api/verifications/:id          — Delete record and file
router.route('/:id').get(getVerificationById).delete(deleteVerification);

// PATCH  /api/verifications/:id/status   — Update verification status
router.patch('/:id/status', updateVerificationStatus);

module.exports = router;
