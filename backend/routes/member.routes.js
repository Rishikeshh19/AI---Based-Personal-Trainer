const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getProgress,
    assignTrainer,
    getCurrentTrainer
} = require('../controllers/member.controller');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/profile')
    .get(getProfile)
    .put(updateProfile);

router.route('/progress')
    .get(getProgress);

router.route('/assign-trainer')
    .put(assignTrainer);

router.route('/current-trainer')
    .get(getCurrentTrainer);

module.exports = router;
