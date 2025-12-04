const express = require('express');
const router = express.Router();
const {
    getWorkoutSuggestions,
    getNutritionAdvice,
    getRecoveryTips
} = require('../controllers/ai-suggestion.controller');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/workout')
    .get(getWorkoutSuggestions);

router.route('/nutrition')
    .get(getNutritionAdvice);

router.route('/recovery')
    .get(getRecoveryTips);

module.exports = router;
