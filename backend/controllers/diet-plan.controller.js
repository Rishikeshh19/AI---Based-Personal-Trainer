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
            cuisinePreference: req.body.cuisinePreference || 'south-indian',
        };

        // Validate required fields
        if (!userData.currentWeight || !userData.targetWeight || !userData.height) {
            return next(new ErrorResponse('Please provide current weight, target weight, and height', 400));
        }

        logger.info(`Generating diet plan (${userData.cuisinePreference}) for user: ${user.email}`);

        // Generate diet plan based on cuisine preference
        const dietPlans = [];
        let variations = [];
        
        if (userData.cuisinePreference === 'south-indian') {
            variations = [
                { type: 'Traditional South Indian', focus: 'traditional South Indian cuisine with Idli, Dosa, Sambar, and authentic South Indian spices' },
                { type: 'High-Protein South Indian', focus: 'high protein South Indian options with Sundals, Dals, and traditional protein sources' },
                { type: 'Light & Healthy South Indian', focus: 'light and easy-to-digest South Indian options with minimal oil' }
            ];
        } else if (userData.cuisinePreference === 'north-indian') {
            variations = [
                { type: 'Traditional North Indian', focus: 'traditional North Indian cuisine with Roti, Dal, and authentic North Indian spices' },
                { type: 'High-Protein North Indian', focus: 'high protein North Indian options with Paneer, Chickpea, and Lentil-based dishes' },
                { type: 'Light & Healthy North Indian', focus: 'light and easy-to-digest North Indian options with whole wheat and minimal oil' }
            ];
        } else {
            variations = [
                { type: 'Traditional Mixed Indian', focus: 'mix of both North and South Indian cuisine' },
                { type: 'High-Protein Mixed Indian', focus: 'high protein options from both North and South India' },
                { type: 'Light & Healthy Mixed Indian', focus: 'light options combining best of both Indian cuisines' }
            ];
        }

        for (const variation of variations) {
            try {
                const plan = await geminiService.generateDietPlanVariation(userData, variation);
                dietPlans.push({
                    type: variation.type,
                    plan: plan,
                    description: `${variation.type} approach - ${variation.focus}`
                });
            } catch (error) {
                logger.error(`Error generating ${variation.type} plan: ${error.message}`);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                dietPlans: dietPlans.length > 0 ? dietPlans : [{ type: 'Standard', plan: generateBasicDietPlan(req.body), description: 'Basic plan' }],
                userData,
                generatedAt: new Date(),
                totalPlans: dietPlans.length,
                cuisinePreference: userData.cuisinePreference
            }
        });
    } catch (error) {
        logger.error(`Diet plan generation error: ${error.message}`);

        // Fallback to basic plan if AI fails
        const basicPlan = generateBasicDietPlan(req.body);
        res.status(200).json({
            success: true,
            data: {
                dietPlans: [{ type: 'Standard', plan: basicPlan, description: 'Basic algorithm plan' }],
                note: 'Generated using basic algorithm (AI service temporarily unavailable)',
                generatedAt: new Date(),
                totalPlans: 1
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

// Helper function for basic diet plan fallback - Indian Style
function generateBasicDietPlan(userData) {
    const { currentWeight, targetWeight, goal, height, age, fitnessLevel, cuisinePreference } = userData;
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const isWeightLoss = currentWeight > targetWeight;
    const bmi = Math.round((currentWeight / ((height / 100) ** 2)) * 10) / 10;
    
    // Calculate personalized calories based on fitness level and goal
    let baseCalorieMultiplier = 24; // base calories per kg
    if (fitnessLevel === 'beginner') baseCalorieMultiplier = 23;
    else if (fitnessLevel === 'intermediate') baseCalorieMultiplier = 24;
    else if (fitnessLevel === 'advanced' || fitnessLevel === 'athlete') baseCalorieMultiplier = 25;
    
    const dailyCalories = isWeightLoss
        ? Math.round(currentWeight * baseCalorieMultiplier * 0.85)
        : Math.round(currentWeight * baseCalorieMultiplier * 1.15);
    
    // Personalized macros based on goal
    let proteinTarget = currentWeight * 1.6; // default
    let carbPercent = 45, fatPercent = 25;
    
    if (goal === 'muscle-gain' || goal === 'strength-building') {
        proteinTarget = currentWeight * 2.2;
        carbPercent = 50;
        fatPercent = 20;
    } else if (goal === 'weight-loss' || goal === 'fat-loss') {
        proteinTarget = currentWeight * 1.8;
        carbPercent = 35;
        fatPercent = 30;
    } else if (goal === 'endurance' || goal === 'stamina') {
        proteinTarget = currentWeight * 1.4;
        carbPercent = 60;
        fatPercent = 20;
    }
    
    const carbsTarget = Math.round((dailyCalories * carbPercent / 100) / 4);
    const fatsTarget = Math.round((dailyCalories * fatPercent / 100) / 9);
    
    // Determine cuisine style
    const isSouthIndian = cuisinePreference === 'south-indian' || !cuisinePreference;
    const isNorthIndian = cuisinePreference === 'north-indian';
    let cuisineTitle = 'Indian';
    if (isSouthIndian) cuisineTitle = 'South Indian';
    else if (isNorthIndian) cuisineTitle = 'North Indian';
    else cuisineTitle = 'Mixed Indian';
    
    // Get meals based on cuisine
    let breakfastOptions, lunchOptions, snackOptions, dinnerOptions;
    
    if (isSouthIndian) {
        breakfastOptions = [
            'Idli (3 pieces) with Sambar and Coconut Chutney',
            'Ragi Porridge (200ml) with Milk and Honey',
            'Upma (1 cup) with Vegetables and Chutney',
            'Ven Pongal (1 cup) with Ginger Chutney',
            'Dosa (1 medium) with Sambar and Chutney'
        ];
        lunchOptions = [
            'Rice (1 cup cooked) with Sambar, Kootu, and Yogurt',
            'Rice (1 cup cooked) with Rasam, Avial, and Pappad',
            'Ragi Mudde (200g) with Dal Curry and Spinach',
            'Millet Rice (1 cup cooked) with Moraiyu and Vegetables',
            'Lentil Rice (1 cup) with Curry and Poriyal'
        ];
        snackOptions = [
            'Sundal (150g) with Lemon and Chutney',
            'Roasted Makhana (30g) with Salt',
            'Buttermilk (200ml) with Curry Leaves',
            'Boiled Chickpea Salad (150g)'
        ];
        dinnerOptions = [
            'Idli (2 pieces) with Light Sambar',
            'Ragi Dosa (1) with Chutney',
            'Kanji (Rice Water - 1 bowl) with Light Vegetable Curry',
            'Roti (2) with Light Dal and Vegetables',
            'Uthappam (1) with Tomato and Vegetable'
        ];
    } else if (isNorthIndian) {
        breakfastOptions = [
            'Paratha (1-2 pieces) with Yogurt',
            'Poha (1.5 cups) with Vegetables and Peanuts',
            'Upma (1 cup) with Semolina and Vegetables',
            'Daliya (1 cup) Porridge with Milk',
            'Oats Khichdi (1 cup) with Vegetables'
        ];
        lunchOptions = [
            'Roti (2) with Dal Tadka and Aloo Gobi',
            'Brown Rice (1 cup) with Rajma and Cucumber Salad',
            'Roti (2) with Paneer Curry and Yogurt',
            'Roti (2) with Chole and Onion Salad',
            'Rice (1 cup) with Baingan Curry and Salad'
        ];
        snackOptions = [
            'Roasted Chana (40g) with Salt and Lemon',
            'Yogurt (150ml) with Dry Fruits',
            'Homemade Ladoo (1-2 pieces)',
            'Milk with Honey (200ml)'
        ];
        dinnerOptions = [
            'Roti (2) with Light Dal and Steamed Vegetables',
            'Khichdi (1.5 cups) with Yogurt',
            'Roti (2) with Moong Dal and Spinach',
            'Light Pulao (1 cup) with Raita',
            'Roti (1) with Vegetable Curry'
        ];
    } else {
        breakfastOptions = [
            'Idli (2) with Sambar OR Poha (1.5 cups) with Vegetables',
            'Ragi Porridge (200ml) with Milk OR Paratha (1) with Yogurt',
            'Upma (1 cup) with Vegetables and Chutney',
            'Ven Pongal (1 cup) OR Daliya Porridge (1 cup)',
            'Mixed Vegetable Dosa (1) OR Whole Wheat Toast (2 slices)'
        ];
        lunchOptions = [
            'Rice (1 cup) with Sambar, Kootu OR Roti (2) with Dal Tadka, Vegetables',
            'Millet Rice (1 cup) with Curry OR Brown Rice (1 cup) with Rajma',
            'Rice (1 cup) with Rasam, Poriyal OR Roti (2) with Paneer Curry',
            'Ragi Mudde (150g) with Curry OR Whole Wheat Pasta (1.5 cups) with Sauce',
            'Lentil Rice (1 cup) with Vegetables OR Roti (2) with Chole Curry'
        ];
        snackOptions = [
            'Sundal (150g) OR Roasted Chana (40g)',
            'Buttermilk (200ml) with Curry Leaves OR Yogurt (150ml)',
            'Makhana (30g) OR Dry Fruits (30g)',
            'Fresh Fruit (1 medium) OR Vegetable Salad (150g)'
        ];
        dinnerOptions = [
            'Idli (2) with Light Sambar OR Roti (1) with Light Dal',
            'Rice Water/Kanji (1 bowl) OR Light Khichdi (1 cup)',
            'Light Rasam (1.5 cups) with Roti (1) OR Light Vegetable Soup',
            'Uthappam (1) with Tomato Chutney OR Roti (1) with Moong Dal',
            'Ragi Dosa (1) OR Light Rice Preparation (1 cup)'
        ];
    }
    
    // Select appropriate option based on fitness level
    const optionIndex = fitnessLevel === 'beginner' ? 0 : fitnessLevel === 'intermediate' ? 1 : 2;
    
    return `
# Personalized ${cuisineTitle} Diet Plan

## Your Profile
- **Age:** ${age} years
- **Current Weight:** ${currentWeight} kg
- **Target Weight:** ${targetWeight} kg  
- **Height:** ${height} cm
- **BMI:** ${bmi}
- **Fitness Level:** ${fitnessLevel}
- **Goal:** ${goal || (isWeightLoss ? 'Weight Loss' : 'Weight Gain')}
- **Weight Change Target:** ${weightDiff.toFixed(1)} kg

## Daily Nutrition Targets
- **Daily Calorie Target:** ${dailyCalories} calories
- **Protein:** ${Math.round(proteinTarget)}g per day (${(proteinTarget / dailyCalories * 400).toFixed(0)}% calories)
- **Carbohydrates:** ${carbsTarget}g per day (${carbPercent}% calories)
- **Fats:** ${fatsTarget}g per day (${fatPercent}% calories)
- **Fiber:** 25-35g per day

## Daily Meal Plan

### Early Morning (5-6 AM) - Optional: 100 calories
- Warm water with lemon and honey OR warm milk

### Breakfast - ${Math.round(dailyCalories * 0.20)} calories
- ${breakfastOptions[optionIndex]}

### Mid-Morning Snack - ${Math.round(dailyCalories * 0.10)} calories
- ${snackOptions[optionIndex]}

### Lunch - ${Math.round(dailyCalories * 0.35)} calories
- ${lunchOptions[optionIndex]}

### Evening Snack - ${Math.round(dailyCalories * 0.10)} calories
- ${snackOptions[(optionIndex + 1) % snackOptions.length]}

### Dinner - ${Math.round(dailyCalories * 0.25)} calories
- ${dinnerOptions[optionIndex]}

### Before Bed (Optional)
- Warm milk with turmeric or chamomile tea

## Personalized Recommendations

${isWeightLoss ? `
**Weight Loss Focus:**
- Eat high protein to preserve muscle during weight loss
- Drink 3-4 liters of water daily
- Avoid fried foods, sugary drinks, and processed snacks
- Include fiber-rich foods for satiety
- Walk for 30-45 minutes daily
- Eat slowly and chew thoroughly (20-30 minutes per meal)
` : `
**Weight Gain Focus:**
- Eat calorie-dense healthy foods like nuts, ghee, and whole grains
- Include protein-rich foods at every meal
- Eat 5-6 smaller meals throughout the day
- Add healthy fats from coconut oil, groundnut oil, and ghee
- Strength training 4-5 days per week is essential
- Sleep 7-9 hours daily for optimal muscle gain
`}

${fitnessLevel === 'beginner' ? `
**Beginner Fitness Tips:**
- Start with simple, familiar foods
- Gradually increase workout intensity
- Focus on consistency over intensity
- Drink water throughout the day
- Avoid skipping meals
- Get 7-8 hours of sleep daily
` : fitnessLevel === 'advanced' || fitnessLevel === 'athlete' ? `
**Advanced Athlete Nutrition:**
- Time carbs around workouts for optimal performance
- Include variety in protein sources for complete amino acids
- Track your macros carefully for competition
- Consider timing meals 2-3 hours before intense workouts
- Hydrate well before, during, and after workouts
- Recovery nutrition (protein + carbs) within 30 mins post-workout
` : `
**Intermediate Level Tips:**
- Balance all macronutrients evenly
- Maintain consistent meal timing
- Adjust portions based on weekly progress
- Include variety to prevent boredom
- Monitor energy levels and appetite
- Adjust as needed every 2 weeks
`}

## ${cuisineTitle} Diet Tips
✅ Drink 2-3 liters of water daily (more if exercising)
✅ Use spices regularly - Turmeric, Ginger, Cumin, Coriander (aids digestion)
✅ Use cooking oil in minimal quantities (2-3 teaspoons per day)
✅ Include multigrain and whole grains daily
✅ Consume yogurt and buttermilk for probiotics
✅ Make lentils a part of your daily diet
✅ Eat seasonal vegetables and fruits
✅ Reduce fried foods like samosa, pakora, and chips
✅ Eat something every 3-4 hours to keep metabolism active
✅ Eat light meals 2-3 hours before sleep
✅ Chew food thoroughly (at least 20-30 chews per bite)
✅ Avoid sugary drinks and processed foods

## Main Indian Protein Sources
- **Lentils:** Moong Dal, Chana Dal, Masoor Dal, Black Lentils, Arhar Dal
- **Dairy:** Yogurt, Paneer, Buttermilk, Milk, Cheese
- **Meat:** Chicken (skinless), Fish, Eggs, Turkey
- **Vegetarian:** Soy, Chickpeas, Kidney Beans, Sprouted Grains, Seeds (Pumpkin, Sunflower)
- **Nuts:** Peanuts, Almonds, Cashews (in moderation)

## Progress Tracking
- Weigh yourself weekly at the same time (morning, after bathroom)
- Track body measurements (chest, waist, hips, arms, thighs)
- Take progress photos every 2 weeks
- Monitor energy levels and workout performance
- Adjust calorie intake if no progress after 2-3 weeks
- Celebrate non-scale victories (strength, endurance, mood)

**Generated:** Personalized plan based on your unique stats (${currentWeight}kg, ${height}cm, ${goal})
**Note:** This is a basic algorithm-based plan. For maximum results with AI recommendations, ensure Gemini API access is available.
    `;
}

module.exports = {
    generateDietPlan: exports.generateDietPlan,
    getDailyMeals: exports.getDailyMeals,
};
