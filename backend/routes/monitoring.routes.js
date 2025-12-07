const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const monitoringController = require('../controllers/monitoring.controller');

// All routes require authentication but NO specific role
// Any authenticated user (member, trainer, user) can access

router.get('/stats', authenticate, monitoringController.getStats);
router.get('/members', authenticate, monitoringController.getAllMembers);
router.get('/trainers', authenticate, monitoringController.getAllTrainers);
router.get('/activity', authenticate, monitoringController.getActivity);
router.get('/dashboard', authenticate, monitoringController.getDashboard);

module.exports = router;
