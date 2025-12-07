const express = require('express');
const router = express.Router();
const {
    getAllTrainers,
    getAssignedClients,
    getClientDetails,
    removeClient,
    getProfile,
    updateProfile
} = require('../controllers/trainer.controller');

const { protect } = require('../middleware/auth');

// Public route to get all trainers
router.route('/').get(protect, getAllTrainers);

// All routes below require authentication
router.use(protect);

// Trainer profile routes
router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

// Trainer clients routes
router.route('/clients')
    .get(getAssignedClients);

router.route('/clients/:clientId')
    .get(getClientDetails)
    .delete(removeClient);

module.exports = router;
