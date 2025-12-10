const express = require('express');
const router = express.Router();
const {
    getAllTrainers,
    getTrainerById,
    getAssignedClients,
    getClientDetails,
    removeClient,
    getProfile,
    updateProfile
} = require('../controllers/trainer.controller');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Trainer profile routes
router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

// Trainer clients routes (must come before /:id route)
router.route('/clients')
    .get(getAssignedClients);

router.route('/clients/:clientId')
    .get(getClientDetails)
    .delete(removeClient);

// Public route to get all trainers (at bottom to avoid conflicts)
router.route('/').get(getAllTrainers);

// Get specific trainer by ID (must be at the end)
router.route('/:id').get(getTrainerById);

module.exports = router;
