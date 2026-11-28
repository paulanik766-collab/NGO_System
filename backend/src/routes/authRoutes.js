const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

router.get('/users', authenticate, authorize('admin', 'manager'), authController.getUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), authController.updateUserRole);
router.put('/users/:id/status', authenticate, authorize('admin'), authController.toggleUserStatus);

module.exports = router;
