const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const monitoringController = require('../controllers/monitoring.controller');

// All routes require authentication but NO specific role
// Any authenticated user (member, trainer, user) can access

router.get('/stats', protect, monitoringController.getStats);
router.get('/members', protect, monitoringController.getAllMembers);
router.get('/trainers', protect, monitoringController.getAllTrainers);
router.get('/activity', protect, monitoringController.getActivity);
router.get('/dashboard', protect, monitoringController.getDashboard);

module.exports = router;
