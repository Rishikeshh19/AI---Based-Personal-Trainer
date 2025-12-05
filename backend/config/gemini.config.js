const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Generation configuration
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
};

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to the AI
 * @param {object} config - Optional generation config
 * @returns {Promise<string>} - The generated content
 */
async function generateContent(prompt, config = {}) {
    try {
        const finalConfig = { ...generationConfig, ...config };
        const result = await model.generateContent(prompt, { generationConfig: finalConfig });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
    }
}

/**
 * Generate diet plan using Gemini
 * @param {object} userData - User profile data
 * @returns {Promise<string>} - Generated diet plan
 */
async function generateDietPlan(userData) {
    const prompt = `You are a professional Indian nutritionist and fitness expert specializing in traditional Indian cuisine. Create a detailed, personalized 7-day INDIAN-STYLE diet plan based on the following user information:

**User Profile:**
- Current Weight: ${userData.currentWeight} kg
- Target Weight: ${userData.targetWeight} kg
- Height: ${userData.height} cm
- Age: ${userData.age} years
- Fitness Level: ${userData.fitnessLevel}
- Main Goal: ${userData.goal}
${userData.dietaryRestrictions ? `- Dietary Restrictions: ${userData.dietaryRestrictions}` : ''}
${userData.medicalConditions ? `- Medical Conditions: ${userData.medicalConditions}` : ''}

**IMPORTANT - INDIAN CUISINE REQUIREMENTS:**
1. **All meals MUST be Indian-style** using authentic Indian ingredients, spices, and cooking methods
2. **Breakfast options**: Include items like Idli, Dosa, Upma, Poha, Paratha, Uttapam, Dhokla, Besan Chilla, Vegetable Oats, Dalia, Moong Dal Cheela, etc.
3. **Lunch & Dinner**: Traditional Indian meals with combinations of Dal (lentils), Rice, Roti/Chapati, Sabzi (vegetable curry), Raita, Salad, Paneer dishes, Chicken/Fish curry (if non-veg), etc.
4. **Snacks**: Include Indian snacks like Roasted Chana, Makhana, Sprouts Chaat, Dhokla, Idli, Fruits, Buttermilk, Lassi, Nuts and Seeds, Moong Dal Pakoda (baked), etc.
5. **Beverages**: Include options like Herbal Tea, Masala Chai (limited), Buttermilk, Nimbu Pani, Coconut Water, Green Tea
6. **Use Indian spices**: Turmeric, Cumin, Coriander, Mustard Seeds, Curry Leaves, Garam Masala, etc. for their health benefits
7. **Regional variety**: Include dishes from different Indian regions (North, South, East, West) throughout the week
8. **Indian portion sizes**: Use familiar Indian measurements (katori, roti, cup, tablespoon)
9. **Meal timing**: Follow typical Indian meal patterns (breakfast 7-9am, lunch 12-2pm, dinner 7-9pm, with mid-morning and evening snacks)

**Meal Plan Structure:**
- Create a detailed 7-day plan with:
  * Early Morning (optional): Warm water with lemon / herbal tea
  * Breakfast (with timing suggestion)
  * Mid-Morning Snack
  * Lunch
  * Evening Snack
  * Dinner
- Include calorie counts for each meal
- Provide macronutrient breakdown (protein, carbs, fats) for each day
- Specify portion sizes in Indian measurements (e.g., 2 medium rotis, 1 katori dal, 150g rice)
- Include preparation tips for easier cooking
- Consider the user's specific goal (weight loss/gain/maintenance) while maintaining Indian cuisine authenticity

**Additional Guidelines:**
- If vegetarian/vegan diet is required, use plenty of dals, paneer, tofu, soy products
- For protein needs, include: Lentils (various types), Chickpeas, Paneer, Yogurt, Eggs (if allowed), Chicken/Fish (if non-veg)
- Use healthy cooking methods: Tandoori, Grilled, Steamed, Boiled, Stir-fried with minimal oil
- Include fiber-rich foods: Whole wheat rotis, Brown rice (alternatively), Vegetables, Fruits
- Limit fried foods and suggest healthier alternatives when needed

Format the response with clear day-wise sections and make it culturally authentic and practical for someone following an Indian lifestyle.`;

    return await generateContent(prompt);
}

/**
 * Generate workout suggestions using Gemini
 * @param {object} userData - User profile and workout history
 * @returns {Promise<string>} - Generated workout suggestions
 */
async function generateWorkoutSuggestions(userData) {
    const prompt = `You are a certified personal trainer. Provide personalized workout recommendations based on:

**User Profile:**
- Fitness Level: ${userData.fitnessLevel}
- Goals: ${userData.goals ? userData.goals.join(', ') : 'General fitness'}
- Age: ${userData.age || 'Not specified'}
- Weight: ${userData.weight || 'Not specified'} kg
${userData.medicalConditions ? `- Medical Conditions/Injuries: ${userData.medicalConditions}` : ''}

**Recent Workout History:**
${userData.recentWorkouts && userData.recentWorkouts.length > 0
            ? userData.recentWorkouts.map(w => `- ${w.name || 'Workout'} on ${w.date}`).join('\n')
            : 'No recent workouts recorded'}

**Instructions:**
1. Recommend 5-7 specific exercises suitable for their fitness level
2. Include sets, reps, and duration for each exercise
3. Provide workout tips specific to their goals
4. Suggest a weekly workout schedule (how many days per week)
5. Include warm-up and cool-down recommendations
6. Consider any medical conditions or injuries

Format the response with clear sections for easy reading.`;

    return await generateContent(prompt);
}

/**
 * Generate nutrition advice using Gemini
 * @param {object} userData - User profile data
 * @returns {Promise<string>} - Generated nutrition advice
 */
async function generateNutritionAdvice(userData) {
    const prompt = `You are a registered Indian dietitian specializing in nutrition advice based on traditional Indian cuisine. Provide comprehensive nutrition advice for:

**User Information:**
- Weight: ${userData.weight} kg
- Height: ${userData.height || 'Not specified'} cm
- Age: ${userData.age || 'Not specified'} years
- Goals: ${userData.goals ? userData.goals.join(', ') : 'General health'}
- Activity Level: ${userData.fitnessLevel}

**Provide Indian Cuisine-Focused Advice:**
1. Daily calorie recommendations
2. Macronutrient targets (protein, carbs, fats in grams) achievable with Indian foods
3. Meal timing suggestions following Indian eating patterns
4. Hydration recommendations (include traditional beverages like buttermilk, coconut water, nimbu pani)
5. Supplement suggestions (if applicable) - consider common deficiencies in Indian diets
6. **Indian Foods to Prioritize:** 
   - Protein sources: Dal (various types), Paneer, Curd, Chickpeas, Eggs, Chicken/Fish
   - Complex carbs: Whole wheat roti, Brown rice, Millets (Jowar, Bajra, Ragi), Quinoa
   - Healthy fats: Ghee (in moderation), Nuts, Seeds
   - Vegetables: Seasonal Indian vegetables, leafy greens (palak, methi)
   - Spices: Turmeric, ginger, garlic, cinnamon for their health benefits
7. **Foods to Limit:** Deep-fried snacks, excessive white rice, refined flour (maida) products, sugary sweets
8. Practical nutrition tips for their specific goal using readily available Indian ingredients

Be specific with numbers and actionable advice that works with Indian cooking and eating habits.`;

    return await generateContent(prompt);
}

/**
 * Generate recovery tips using Gemini
 * @param {object} userData - User profile data
 * @returns {Promise<string>} - Generated recovery tips
 */
async function generateRecoveryTips(userData) {
    const prompt = `You are a sports physiotherapist and recovery specialist. Provide personalized recovery advice for:

**User Profile:**
- Fitness Level: ${userData.fitnessLevel}
- Age: ${userData.age || 'Adult'}
- Training Intensity: ${userData.fitnessLevel}

**Provide:**
1. Sleep recommendations (duration and quality tips)
2. Active recovery exercises
3. Stretching routines
4. Foam rolling techniques
5. Rest day strategies
6. Signs of overtraining to watch for
7. Recovery nutrition tips
8. Stress management techniques

Make it practical and actionable with specific time durations and frequencies.`;

    return await generateContent(prompt);
}

module.exports = {
    generateContent,
    generateDietPlan,
    generateWorkoutSuggestions,
    generateNutritionAdvice,
    generateRecoveryTips,
    model,
};
