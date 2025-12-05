const express = require('express');
const router = express.Router();
const { generateDietPlan, getDailyMeals } = require('../controllers/diet-plan.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/diet-plan/generate - Generate personalized diet plan
router.post('/generate', generateDietPlan);

// GET /api/diet-plan/meals - Get daily meal suggestions
router.get('/meals', getDailyMeals);

module.exports = router;
