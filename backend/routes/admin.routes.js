const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth');
const checkAdminRole = require('../middleware/admin');

// All routes require authentication and admin role
router.use(authenticate);
router.use(checkAdminRole);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Statistics and activity routes
router.get('/stats', adminController.getSystemStats);
router.get('/activity-log', adminController.getActivityLog);

module.exports = router;
