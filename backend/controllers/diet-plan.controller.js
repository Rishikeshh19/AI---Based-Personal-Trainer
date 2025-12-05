const geminiService = require('../config/gemini.config');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Generate personalized diet plan
// @route   POST /api/diet-plan/generate
// @access  Private
exports.generateDietPlan = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        const userData = {
            currentWeight: req.body.currentWeight || user.profile?.weight,
            targetWeight: req.body.targetWeight,
            height: req.body.height || user.profile?.height,
            age: req.body.age || user.profile?.age,
            fitnessLevel: req.body.fitnessLevel || user.profile?.fitnessLevel,
            goal: req.body.goal || (user.profile?.goals && user.profile.goals[0]),
            dietaryRestrictions: req.body.dietaryRestrictions || '',
            medicalConditions: req.body.medicalConditions || '',
        };

        // Validate required fields
        if (!userData.currentWeight || !userData.targetWeight || !userData.height) {
            return next(new ErrorResponse('Please provide current weight, target weight, and height', 400));
        }

        logger.info(`Generating diet plan for user: ${user.email}`);

        // Call Gemini API to generate diet plan
        const dietPlan = await geminiService.generateDietPlan(userData);

        res.status(200).json({
            success: true,
            data: {
                dietPlan,
                userData,
                generatedAt: new Date(),
            }
        });
    } catch (error) {
        logger.error(`Diet plan generation error: ${error.message}`);

        // Fallback to basic plan if AI fails
        const basicPlan = generateBasicDietPlan(req.body);
        res.status(200).json({
            success: true,
            data: {
                dietPlan: basicPlan,
                note: 'Generated using basic algorithm (AI service temporarily unavailable)',
                generatedAt: new Date(),
            }
        });
    }
});

// @desc    Get daily meal suggestions
// @route   GET /api/diet-plan/meals
// @access  Private
exports.getDailyMeals = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        const userData = {
            weight: user.profile?.weight,
            height: user.profile?.height,
            goal: user.profile?.goals && user.profile.goals[0],
            fitnessLevel: user.profile?.fitnessLevel,
        };

        const prompt = `Suggest 5 healthy meals for someone with these goals: ${userData.goal}. 
        Include breakfast, lunch, dinner, and 2 snacks. Each meal should include:
        - Name
        - Brief description
        - Approximate calories
        - Key macronutrients
        Keep it simple and practical.`;

        const meals = await geminiService.generateContent(prompt);

        res.status(200).json({
            success: true,
            data: {
                meals,
                date: new Date(),
            }
        });
    } catch (error) {
        logger.error(`Meal suggestions error: ${error.message}`);
        return next(new ErrorResponse('Failed to generate meal suggestions', 500));
    }
});

// Helper function for basic diet plan fallback
function generateBasicDietPlan(userData) {
    const { currentWeight, targetWeight, goal } = userData;
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const isWeightLoss = currentWeight > targetWeight;

    const dailyCalories = isWeightLoss
        ? Math.round(currentWeight * 24 * 0.85)
        : Math.round(currentWeight * 24 * 1.15);

    return `
# Basic 7-Day Diet Plan

**Goal:** ${goal || (isWeightLoss ? 'Weight Loss' : 'Weight Gain')}
**Daily Calorie Target:** ${dailyCalories} calories
**Weight Change Target:** ${weightDiff.toFixed(1)} kg

## Daily Meal Structure:

### Breakfast (${Math.round(dailyCalories * 0.25)} calories)
- Oatmeal with fruits and nuts
- Greek yogurt with berries
- Whole grain toast with avocado

### Lunch (${Math.round(dailyCalories * 0.35)} calories)
- Grilled chicken with quinoa and vegetables
- Salmon with brown rice and salad
- Turkey wrap with whole grain tortilla

### Dinner (${Math.round(dailyCalories * 0.30)} calories)
- Lean protein (fish, chicken, tofu) with vegetables
- Stir-fry with lean meat and mixed vegetables
- Vegetable soup with whole grain bread

### Snacks (${Math.round(dailyCalories * 0.10)} calories each)
- Nuts and seeds
- Fruit
- Protein shake
- Vegetable sticks with hummus

## Macronutrient Targets:
- Protein: ${Math.round(currentWeight * 2)}g per day
- Carbohydrates: ${Math.round(dailyCalories * 0.4 / 4)}g per day
- Fats: ${Math.round(dailyCalories * 0.25 / 9)}g per day

## Tips:
- Drink 2-3 liters of water daily
- Eat every 3-4 hours
- Prepare meals in advance
- Track your food intake
- Adjust portions based on progress

*Note: This is a basic plan. For personalized recommendations, ensure AI service is available.*
    `;
}

module.exports = {
    generateDietPlan: exports.generateDietPlan,
    getDailyMeals: exports.getDailyMeals,
};
