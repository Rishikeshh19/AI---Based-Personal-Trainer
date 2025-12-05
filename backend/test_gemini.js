const geminiService = require('./config/gemini.config');
require('dotenv').config();

async function testGeminiIntegration() {
    console.log('🧪 Testing Gemini API Integration...\n');

    // Test 1: Check API key
    console.log('1️⃣  Checking API key...');
    if (process.env.GEMINI_API_KEY) {
        console.log('✅ GEMINI_API_KEY found in environment');
        console.log(`   Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`);
    } else {
        console.log('❌ GEMINI_API_KEY not found in environment');
        process.exit(1);
    }

    // Test 2: Simple content generation
    console.log('\n2️⃣  Testing basic content generation...');
    try {
        const testPrompt = 'Say "Hello from Gemini AI" in a friendly way';
        const response = await geminiService.generateContent(testPrompt);
        console.log('✅ Content generation successful!');
        console.log(`   Response: ${response.substring(0, 100)}...`);
    } catch (error) {
        console.log('❌ Content generation failed:', error.message);
        process.exit(1);
    }

    // Test 3: Diet plan generation
    console.log('\n3️⃣  Testing diet plan generation...');
    try {
        const userData = {
            currentWeight: 75,
            targetWeight: 70,
            height: 175,
            age: 30,
            fitnessLevel: 'intermediate',
            goal: 'weight-loss',
            dietaryRestrictions: '',
            medicalConditions: '',
        };
        const dietPlan = await geminiService.generateDietPlan(userData);
        console.log('✅ Diet plan generation successful!');
        console.log(`   Generated ${dietPlan.length} characters of content`);
    } catch (error) {
        console.log('❌ Diet plan generation failed:', error.message);
    }

    // Test 4: Workout suggestions
    console.log('\n4️⃣  Testing workout suggestions...');
    try {
        const userData = {
            fitnessLevel: 'beginner',
            goals: ['weight loss'],
            age: 25,
            weight: 80,
            recentWorkouts: [],
        };
        const workoutSuggestions = await geminiService.generateWorkoutSuggestions(userData);
        console.log('✅ Workout suggestions successful!');
        console.log(`   Generated ${workoutSuggestions.length} characters of content`);
    } catch (error) {
        console.log('❌ Workout suggestions failed:', error.message);
    }

    // Test 5: Nutrition advice
    console.log('\n5️⃣  Testing nutrition advice...');
    try {
        const userData = {
            weight: 70,
            height: 170,
            age: 28,
            goals: ['muscle gain'],
            fitnessLevel: 'intermediate',
        };
        const nutritionAdvice = await geminiService.generateNutritionAdvice(userData);
        console.log('✅ Nutrition advice successful!');
        console.log(`   Generated ${nutritionAdvice.length} characters of content`);
    } catch (error) {
        console.log('❌ Nutrition advice failed:', error.message);
    }

    console.log('\n🎉 All tests completed!\n');
}

// Run tests
testGeminiIntegration().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
