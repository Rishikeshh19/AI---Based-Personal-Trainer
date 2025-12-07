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

        logger.info(`Generating multiple diet plans for user: ${user.email}`);

        // Generate 3 different diet plan variations - Indian Style
        const dietPlans = [];
        const variations = [
            { type: 'Traditional Indian', focus: 'traditional Indian cuisine with rice, dals, vegetables and authentic Indian spices' },
            { type: 'High-Protein Indian', focus: 'high protein Indian options with protein-rich dals, paneer, eggs and plant-based sources' },
            { type: 'Light & Healthy Indian', focus: 'light and easy-to-digest Indian options with focus on seasonal vegetables and minimal oil' }
        ];

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
                totalPlans: dietPlans.length
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

<<<<<<< HEAD
// Helper function for basic diet plan fallback
=======
// Helper function for basic diet plan fallback - Indian Style
>>>>>>> bfac5fa (Updated backend, frontend, removed old docs, added admin system)
function generateBasicDietPlan(userData) {
    const { currentWeight, targetWeight, goal } = userData;
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const isWeightLoss = currentWeight > targetWeight;

    const dailyCalories = isWeightLoss
        ? Math.round(currentWeight * 24 * 0.85)
        : Math.round(currentWeight * 24 * 1.15);

    return `
<<<<<<< HEAD
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
=======
# 🇮🇳 भारतीय आहार योजना (Indian Diet Plan) - 7 Days

**लक्ष्य (Goal):** ${goal || (isWeightLoss ? 'वजन घटाना (Weight Loss)' : 'वजन बढ़ाना (Weight Gain)')}
**दैनिक कैलोरी लक्ष्य (Daily Calorie Target):** ${dailyCalories} calories
**वजन परिवर्तन लक्ष्य (Weight Change Target):** ${weightDiff.toFixed(1)} kg

## दैनिक भोजन संरचना (Daily Meal Structure):

### नाश्ता (Breakfast) - ${Math.round(dailyCalories * 0.25)} calories
☀️ विकल्प 1: इडली + सांभार + नारियल की चटनी
☀️ विकल्प 2: दलिया + दूध + गुड़ + मेवे
☀️ विकल्प 3: उपमा + नारियल की चटनी + एक संतरा
☀️ विकल्प 4: पोहा (चिड़वा) + अंडा (या दही)
☀️ विकल्प 5: रागी का पोरिज + दूध + शहद

### दोपहर का खाना (Lunch) - ${Math.round(dailyCalories * 0.35)} calories
🍛 विकल्प 1: चिकन करी + भूरे चावल + सलाद
🍛 विकल्प 2: दाल (तड़का) + रोटी (मल्टीग्रेन) + उबली सब्जियां
🍛 विकल्प 3: मछली करी (कम तेल) + बासमती चावल + ककड़ी का सलाद
🍛 विकल्प 4: छोले की सब्जी + ज्वार की रोटी + प्याज
🍛 विकल्प 5: पनीर सब्जी (कम तेल) + गेहूं की रोटी + दही

### शाम का नाश्ता (Evening Snack) - ${Math.round(dailyCalories * 0.10)} calories
🥤 विकल्प 1: छाछ + मखाने
🥤 विकल्प 2: अंकुरित मूंग + नींबू
🥤 विकल्प 3: दही + सूखे मेवे
🥤 विकल्प 4: चाय + बिस्किट (कम मीठा)

### रात का खाना (Dinner) - ${Math.round(dailyCalories * 0.30)} calories
🌙 विकल्प 1: मछली का सूप + मल्टीग्रेन रोटी
🌙 विकल्प 2: दाल + सब्जी (मेथी, पालक, लौकी)
🌙 विकल्प 3: चिकन टिक्का (भूनी हुई) + गेहूं की रोटी
🌙 विकल्प 4: राजमा (कम तेल) + ब्राउन राइस
🌙 विकल्प 5: सब्जी का हल्का सूप + मल्टीग्रेन रोटी

## मैक्रोन्यूट्रिएंट लक्ष्य (Macronutrient Targets):
💪 प्रोटीन (Protein): ${Math.round(currentWeight * 1.8)}g प्रति दिन
🍚 कार्बोहाइड्रेट (Carbohydrates): ${Math.round(dailyCalories * 0.4 / 4)}g प्रति दिन
🥥 वसा (Fats): ${Math.round(dailyCalories * 0.25 / 9)}g प्रति दिन
🥬 रेशा (Fiber): 25-30g प्रति दिन

## भारतीय आहार संबंधी सुझाव (Indian Diet Tips):
✅ 2-3 लीटर पानी रोज़ पिएं
✅ मसालों का उपयोग करें - हल्दी, अदरक, जीरा, धनिया (पाचन में मदद)
✅ घी/तेल कम से कम मात्रा में इस्तेमाल करें
✅ रोज़ मल्टीग्रेन/साबुत अनाज खाएं
✅ दही और छाछ नियमित रूप से लें
✅ दालें हर दिन का हिस्सा बनाएं
✅ मौसमी सब्जियां और फल खाएं
✅ पानीपूरी, समोसे, तेल में तली चीजें कम करें
✅ 3-4 घंटे में कुछ न कुछ खाएं
✅ सोने से 2-3 घंटे पहले हल्का खाना खाएं

## मुख्य भारतीय प्रोटीन स्रोत (Protein Sources):
🌾 दालें: मूंग दाल, चने की दाल, मसूर दाल, काली दाल
🥛 दुग्ध पदार्थ: दही, पनीर, छाछ, दूध
🍗 मांस: चिकन (त्वचा हटाकर), मछली, अंडे
🌱 पौधे: सोया, अंकुरित अनाज, सीड्स

*नोट: यह एक मूल योजना है। बेहतर सलाह के लिए पोषण विशेषज्ञ से मिलें।*
*Note: This is a basic plan. For personalized recommendations, consult a nutritionist.*
>>>>>>> bfac5fa (Updated backend, frontend, removed old docs, added admin system)
    `;
}

module.exports = {
    generateDietPlan: exports.generateDietPlan,
    getDailyMeals: exports.getDailyMeals,
};
