const express = require('express');
const router = express.Router();
const {
    getWorkoutSuggestions,
    getNutritionAdvice,
    getRecoveryTips,
    getPersonalizedSuggestions
} = require('../controllers/ai-suggestion.controller');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// New personalized suggestions endpoint (POST)
router.route('/personalized')
    .post(getPersonalizedSuggestions);

// Existing endpoints
router.route('/workout')
    .get(getWorkoutSuggestions);

router.route('/nutrition')
    .get(getNutritionAdvice);

router.route('/recovery')
    .get(getRecoveryTips);

module.exports = router;
