const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini 1.5 Flash model (gemini-pro is deprecated)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Generation configuration
const generationConfig = {
    temperature: 0.3,
    topP: 0.9,
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
    const prompt = `LANGUAGE REQUIREMENT: You MUST respond ONLY in English. Do NOT write in Hindi, Hinglish, or any non-English language. All output must be 100% in English.

You are a professional South Indian nutritionist and fitness expert specializing in traditional South Indian cuisine (Tamil Nadu, Kerala, Karnataka, Andhra/Telangana). Create a detailed, personalized 7-day SOUTH INDIAN diet plan based on the following user information:

**User Profile:**
- Current Weight: ${userData.currentWeight} kg
- Target Weight: ${userData.targetWeight} kg
- Height: ${userData.height} cm
- Age: ${userData.age} years
- Fitness Level: ${userData.fitnessLevel}
- Main Goal: ${userData.goal}
${userData.dietaryRestrictions ? `- Dietary Restrictions: ${userData.dietaryRestrictions}` : ''}
${userData.medicalConditions ? `- Medical Conditions: ${userData.medicalConditions}` : ''}

**SOUTH INDIAN CUISINE - English ONLY:**
Use ONLY English names and descriptions. No Hindi translations.

1. **Breakfast Options (in ENGLISH only)**:
   - Idli with Sambar and Coconut Chutney
   - Dosa with Sambar and Chutney
   - Ragi Malt or Finger Millet Porridge
   - Upma (made with semolina)
   - Ven Pongal (savory rice and lentil dish)
   - Puttu with Curry
   - Appam (fermented rice cake)
   - Adai (lentil crepe - high protein)

2. **Lunch Components (in ENGLISH only)**:
   - Rice (white, brown, or red rice)
   - Sambar (lentil and vegetable stew)
   - Rasam (tangy lentil soup)
   - Curry preparations with coconut
   - Kootu (mixed vegetables with lentils)
   - Avial (mixed vegetables in coconut gravy)
   - Yogurt or Buttermilk

3. **Dinner (in ENGLISH only)**:
   - Idli or Light Dosa
   - Rice porridge (Kanji)
   - Light curry with vegetables

4. **Snacks (in ENGLISH only)**:
   - Sundal (chickpea or peanut salad)
   - Roasted peanuts
   - Buttermilk
   - Fresh fruit

**Macronutrient Targets (English descriptions only):**
- Protein per kilogram: 1.2 to 1.5 grams
- Carbohydrates from rice and millets
- Healthy fats from coconut oil and ground nut oil

**Format your response:**
- Write clear day-by-day meal plans
- Include portion sizes
- List calories and macros for each meal
- Use ONLY English throughout
- Do NOT mix languages
- Do NOT translate to Hindi

Begin the 7-day meal plan now in ENGLISH:`;

    return await generateContent(prompt);
}

/**
 * Generate workout suggestions using Gemini
 * @param {object} userData - User profile and workout history
 * @returns {Promise<string>} - Generated workout suggestions
 */
async function generateWorkoutSuggestions(userData) {
    const fitnessLevelGuide = {
        beginner: "3-4 days per week, 30-45 minutes per session",
        intermediate: "4-5 days per week, 45-60 minutes per session",
        advanced: "5-6 days per week, 60-90 minutes per session",
        athlete: "6-7 days per week with periodized training"
    };

    const prompt = `You are a certified professional personal trainer and fitness coach with 10+ years of experience. Provide HIGHLY PERSONALIZED and EFFECTIVE workout recommendations based on:

**User Profile:**
- Fitness Level: ${userData.fitnessLevel}
- Goals: ${userData.goals ? userData.goals.join(', ') : 'General fitness'}
- Age: ${userData.age || 'Not specified'} years
- Weight: ${userData.weight || 'Not specified'} kg
- Height: ${userData.height || 'Not specified'} cm
${userData.medicalConditions ? `- Medical Conditions/Injuries: ${userData.medicalConditions}` : ''}

**Recent Workout History:**
${userData.recentWorkouts && userData.recentWorkouts.length > 0
            ? userData.recentWorkouts.map(w => `- ${w.name || 'Workout'} on ${w.date}`).join('\n')
            : 'No recent workouts recorded'}

**COMPREHENSIVE INSTRUCTIONS - PROVIDE DETAILED RECOMMENDATIONS:**

1. **Workout Schedule**: ${fitnessLevelGuide[userData.fitnessLevel] || "4-5 days per week, 45-60 minutes"}
   
2. **Recommended Exercises (Minimum 7-10 exercises):**
   - For EACH exercise provide: NAME, SETS, REPS, REST TIME (in seconds), FORM TIPS, TARGET MUSCLES
   - Include progressive variations (beginner → intermediate → advanced versions)
   - Mix compound movements and isolation exercises

3. **Weekly Schedule Template:**
   - Monday: [Specific muscle group with 4-5 exercises]
   - Tuesday: [Specific muscle group with 4-5 exercises]
   - Wednesday: [Rest or active recovery]
   - Thursday-Sunday: [Detailed breakdown]

4. **Goal-Specific Adjustments:**
   - If WEIGHT LOSS: Include cardio recommendations (frequency, intensity, duration), calorie burn estimates
   - If MUSCLE GAIN: Emphasize progressive overload, rest periods, protein timing
   - If ATHLETIC PERFORMANCE: Include sport-specific drills and agility work
   - If MAINTENANCE: Balance strength, cardio, and flexibility

5. **Recovery & Safety:**
   - Warm-up protocol (5-10 minutes with specific exercises)
   - Cool-down stretching routine (5-10 minutes)
   - Injury prevention tips specific to their profile
   - Rest day recommendations

6. **Progression Strategy:**
   - How to increase intensity every 2-4 weeks
   - When to add weight/reps
   - How to prevent plateaus

7. **Equipment Needed:**
   - Home gym alternatives if needed
   - Gym equipment recommendations

8. **Nutrition Pairing:**
   - Pre-workout meal suggestions (timing and macros)
   - Post-workout nutrition (protein, carbs, timing)

Be SPECIFIC with numbers, timing, and actionable steps. Make it a complete training program that addresses their specific goals and fitness level.`;

    return await generateContent(prompt);
}

/**
 * Generate nutrition advice using Gemini
 * @param {object} userData - User profile data
 * @returns {Promise<string>} - Generated nutrition advice
 */
async function generateNutritionAdvice(userData) {
    const prompt = `You are a registered Indian dietitian and nutrition expert specializing in personalized nutrition for fitness goals using traditional Indian cuisine. Provide COMPREHENSIVE and HIGHLY EFFECTIVE nutrition advice:

**User Information:**
- Weight: ${userData.weight} kg
- Height: ${userData.height || 'Not specified'} cm
- Age: ${userData.age || 'Not specified'} years
- Goals: ${userData.goals ? userData.goals.join(', ') : 'General health'}
- Activity Level/Fitness Level: ${userData.fitnessLevel}
${userData.dietaryRestrictions ? `- Dietary Restrictions: ${userData.dietaryRestrictions}` : ''}
${userData.medicalConditions ? `- Medical Conditions: ${userData.medicalConditions}` : ''}

**DETAILED NUTRITION RECOMMENDATIONS:**

1. **Daily Caloric Requirements:**
   - Calculate and provide SPECIFIC daily calorie target
   - Explain how this was calculated (BMR × Activity Factor)
   - Provide calorie ranges for different goals (deficit, maintenance, surplus)

2. **Macronutrient Breakdown (in GRAMS per day):**
   - Protein: ___ g/day (grams and sources)
   - Carbohydrates: ___ g/day (types and timing)
   - Fats: ___ g/day (healthy sources)
   - Fiber: ___ g/day (minimum)

3. **Indian Foods for EACH Macronutrient:**
   
   **Protein Sources (Choose variety):**
   - Dals: Moong dal (20g protein/cup), Masoor dal (18g), Chana dal, Urad dal
   - Legumes: Black chickpeas (Kala chana), White chickpeas (Kabuli chana), Kidney beans
   - Dairy: Paneer (25g/100g), Greek yogurt, Curd, Milk, Ghee (moderation)
   - Eggs: 1 egg = 6g protein
   - Meat/Fish: Chicken breast (165 cal, 31g protein), Fish (Tilapia, Mackerel), Mutton
   - Soy products: Soy chunks, Tofu
   - Nuts/Seeds: Peanuts, Almonds, Sesame seeds (til)

   **Complex Carbohydrate Sources:**
   - Whole Grains: Brown rice, Red Matta rice, Basmati rice (smaller portions)
   - Millets: Ragi (Finger millet), Jowar (Sorghum), Bajra (Pearl millet), Thinai, Samai - highly nutritious
   - Legumes: Dal mentioned above (dual benefit: carbs + protein)
   - Breads: Whole wheat roti (1 roti = 70 cal), Bajra roti, Ragi roti
   - Vegetables: Sweet potato, Potato (in moderation), Beetroot
   - Fruits: Banana (local varieties), Papaya, Mango, Coconut (fresh)

   **Healthy Fat Sources:**
   - Oils: Virgin coconut oil, Gingelly/Sesame oil, Groundnut oil (1 tsp = 45 cal)
   - Ghee: 1 tsp = 45 cal (use for flavor, not quantity)
   - Nuts: Almonds (10-15/day), Cashews (8-10/day), Coconut (fresh)
   - Seeds: Pumpkin seeds, Sunflower seeds, Sesame seeds
   - Avocado (if available)

   **Vegetables (unlimited portions):**
   - Leafy greens: Spinach (Palak), Fenugreek (Methi), Amaranth (Cholai)
   - Cruciferous: Cabbage, Cauliflower, Broccoli
   - Colorful: Carrots, Beetroot, Tomatoes, Bell peppers
   - Gourds: Bottle gourd, Ridge gourd, Ash gourd
   - Other: Okra (Bhindi), Mushrooms (Buttonbhat), Peas

4. **Meal Timing & Frequency:**
   - Early Morning (6-7 AM): Warm water with lemon/honey
   - Breakfast (7-8 AM): [Specific meal suggestions based on goals]
   - Mid-Morning (10 AM): [Light snack option]
   - Lunch (1-2 PM): [Balanced meal with specified portions]
   - Evening Snack (4-5 PM): [Protein-rich snack]
   - Dinner (7-8 PM): [Light, digestible meal]
   - Pre-Sleep (if hungry): Warm milk with turmeric

5. **Hydration Strategy:**
   - Daily water target: ___ liters
   - Hydrating beverages: 
     * Warm water (morning)
     * Jeera water (digestive)
     * Coconut water (pre/post workout)
     * Buttermilk/Neer Mor (mid-day, probiotic)
     * Herbal teas (ginger, tulsi, green tea)
   - Timing: Drink water 30 min before meals, 2 hours after meals

6. **Spices for Health Benefits:**
   - Turmeric (anti-inflammatory): Use in dal, rice, milk
   - Ginger: Ginger-garlic paste for curries, ginger tea
   - Cumin (Jeera): Aids digestion, use in water or dal
   - Fenugreek (Methi): Blood sugar control
   - Cinnamon: Improves metabolism
   - Coriander: Cooling, aids digestion
   - Clove: Metabolism booster

7. **Foods to AVOID / MINIMIZE:**
   - Deep-fried items: Samosas, Pakoras, Chips, Fried snacks (High in calories, unhealthy fats)
   - Refined flour: Maida-based products, white bread, pasta
   - Excessive sugar: Sweets (Jaggery-based), Chocolate, Sugary drinks, Condensed milk
   - Processed foods: Instant noodles, Canned foods with preservatives
   - Excess salt: Limit to 2000mg/day
   - Alcohol: Minimize or avoid

8. **GOAL-SPECIFIC MEAL PLANS:**

   **IF WEIGHT LOSS:**
   - Create 500-calorie daily deficit
   - Increase protein to 35% of calories (helps satiety)
   - Increase fiber (adds bulk without calories)
   - Sample meals with calorie counts
   - Hydration importance (pre-meal water)

   **IF MUSCLE GAIN:**
   - Increase calories by 300-500/day
   - Protein: 1.6-2g per kg body weight
   - Carbs timing: Post-workout meals with 30-40g carbs
   - Healthy fats: Important for hormone production
   - Sample muscle-building meals with macros

   **IF MAINTENANCE/GENERAL FITNESS:**
   - Balanced macros (40% carbs, 30% protein, 30% fats)
   - Focus on nutrient density
   - Variety of Indian foods

9. **Supplement Recommendations (if applicable):**
   - Multivitamin: If diet is restricted
   - Vitamin D: Important in India (deficiency common) - 1000-2000 IU/day
   - Protein powder: If food sources insufficient (whey or plant-based)
   - Creatine: If muscle gain goal
   - Others based on deficiencies

10. **Weekly Shopping List:**
    - [Specific items needed for the nutrition plan]
    - Local availability options
    - Cost-effective alternatives

11. **Practical Implementation Tips:**
    - How to meal prep for week
    - Restaurant/eating out options following the plan
    - How to adjust when traveling
    - Family/cultural meal integration

12. **Progress Tracking:**
    - How often to weigh/measure
    - What metrics beyond weight to track
    - When to adjust calories

Be SPECIFIC with actual meal examples, portion sizes in cups/teaspoons, calorie counts, and ACTIONABLE advice that fits Indian cooking and eating culture.`;

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

/**
 * Generate diet plan variation using Gemini
 * @param {object} userData - User profile data
 * @param {object} variation - Variation type (Traditional, High-Protein, Light & Healthy)
 * @returns {Promise<string>} - Generated diet plan variation
 */
async function generateDietPlanVariation(userData, variation) {
    let additionalGuidance = '';
    let cuisineSection = '';
    
    // Determine cuisine type
    const isSouthIndian = userData.cuisinePreference === 'south-indian' || !userData.cuisinePreference;
    const isNorthIndian = userData.cuisinePreference === 'north-indian';
    
    // Add variation-specific guidance
    if (variation.type.includes('High-Protein')) {
        additionalGuidance = `
**PROTEIN-FOCUSED EMPHASIS:**
- Include high-protein items in every meal
- Aim for 1.2-1.5g protein per kg body weight
- ${isSouthIndian ? 'Sundals, Dals, Paneer, Eggs, Fish (Kerala style)' : 'Paneer, Chickpea, Lentils, Eggs, Chicken'}
- Focus on plant-based and animal-based protein sources
`;
    } else if (variation.type.includes('Light & Healthy')) {
        additionalGuidance = `
**LIGHT & EASY-TO-DIGEST EMPHASIS:**
- Focus on steamed and boiled preparations
- Minimal oil and spices
- Include plenty of seasonal vegetables
- Evening meals should be very light
- ${isSouthIndian ? 'Kanji (Rice water), warm buttermilk, light rasam' : 'Clear broths, light dal, steamed vegetables'}
`;
    }
    
    // Build cuisine-specific requirements
    if (isSouthIndian) {
        cuisineSection = `
**IMPORTANT - SOUTH INDIAN CUISINE REQUIREMENTS:**
1. **STRICTLY SOUTH INDIAN STYLE ONLY**: Focus on Rice, Millets, and South Indian preparations.
2. **NO WESTERN FOOD**: Avoid oatmeal, bread, pasta unless South Indian style (Kosambari, Sundal).
3. **Cooking Oil**: Coconut Oil, Gingelly (Sesame) Oil, or Groundnut Oil.
4. **Breakfast Options**: 
   - Idli/Dosa with Sambar/Chutney
   - Ragi Malt/Porridge
   - Upma/Uppumavu
   - Pongal (Ven Pongal)
   - Puttu/Appam/Idiyappam
   - Adai (high protein lentil dosa)
   - Pesarattu
5. **Lunch Components**: 
   - Rice (White/Brown/Red Matta Rice) or Millets (Ragi, Thinai, Samai)
   - Sambar/Rasam/Vatha Kuzhambu/Mor Kuzhambu
   - Kootu (Lentil + Veg)
   - Poriyal/Thoran/Avial
   - Curd/Buttermilk
6. **Dinner**: Idli, Millet Dosa, Uthappam, Ragi Mudde, or Kanji
7. **Snacks**: Sundal, Roasted Makhana, Buttermilk, Pori (Puffed rice), Boiled Peanuts
8. **Hydration**: Warm water, Jeera water, Buttermilk
`;
    } else if (isNorthIndian) {
        cuisineSection = `
**IMPORTANT - NORTH INDIAN CUISINE REQUIREMENTS:**
1. **FOCUS ON NORTH INDIAN STYLE**: Use whole wheat Roti/Chapati, Bajra, Jowar preparations.
2. **Cooking Oil**: Mustard Oil, Ghee, or Refined Oil.
3. **Breakfast Options**:
   - Paratha (Plain/Vegetable/Egg)
   - Poha
   - Upma (with suji/semolina)
   - Daliya (broken wheat porridge)
   - Khichdi
   - Stuffed Aloo Parathas
4. **Lunch Components**:
   - Whole wheat Roti/Chapati
   - White/Basmati Rice (moderate)
   - Dal preparations (Tadka, Makhni, Chana)
   - Curries (Aloo Gobi, Rajma, Chole, Paneer)
   - Plain yogurt/Lassi
5. **Dinner**: Light roti, khichdi, or dal preparation
6. **Snacks**: Chickpea salad, Roasted chana, Homemade laddoos
7. **Hydration**: Water, herbal teas, fresh juices
`;
    } else {
        cuisineSection = `
**IMPORTANT - MIXED INDIAN CUISINE REQUIREMENTS:**
1. **MIX OF NORTH AND SOUTH**: Alternate between regional styles throughout the week.
2. **Balance**: Use variety of cooking methods and regional specialties.
3. **Cooking Oil**: Mix of Coconut Oil, Mustard Oil, Groundnut Oil, Ghee.
4. **Breakfast Options**: Rotate between South Indian (Idli, Dosa) and North Indian (Paratha, Poha)
5. **Lunch**: Mix Rice and Roti preparations with regional curries
6. **Dinner**: Light preparations from both regions
`;
    }
    
    const prompt = `STRICT LANGUAGE REQUIREMENT: You MUST respond ONLY in English. Do NOT write in Hindi, Hinglish, or any non-English language. Every single word must be in English.

You are a professional nutritionist and fitness expert specializing in ${isSouthIndian ? 'traditional South Indian' : isNorthIndian ? 'traditional North Indian' : 'Indian'} cuisine. Create a detailed, personalized 7-day ${userData.cuisinePreference === 'mixed-indian' ? 'Mixed Indian' : isSouthIndian ? 'SOUTH INDIAN' : 'NORTH INDIAN'} diet plan (${variation.type} variation).

**User Profile:**
- Current Weight: ${userData.currentWeight} kg
- Target Weight: ${userData.targetWeight} kg
- Height: ${userData.height} cm
- Age: ${userData.age} years
- Fitness Level: ${userData.fitnessLevel}
- Main Goal: ${userData.goal}
${userData.dietaryRestrictions ? `- Dietary Restrictions: ${userData.dietaryRestrictions}` : ''}
${userData.medicalConditions ? `- Medical Conditions: ${userData.medicalConditions}` : ''}

${additionalGuidance}

${cuisineSection}

**CRITICAL: Write ONLY in English. No Hindi. No Mixed Language. ENGLISH ONLY.**

**Meal Plan Structure (in ENGLISH):**
Create a detailed 7-day plan with daily meals:
- Early Morning
- Breakfast
- Mid-Morning Snack
- Lunch
- Evening Snack  
- Dinner

For each meal provide:
- Food items (in English)
- Portion size (in English units like cups, spoons)
- Calories
- Protein grams
- Carbs grams
- Fats grams

**Start the 7-day meal plan now - ENGLISH ONLY:**`;

    return await generateContent(prompt);
}

module.exports = {
    generateContent,
    generateDietPlan,
    generateDietPlanVariation,
    generateWorkoutSuggestions,
    generateNutritionAdvice,
    generateRecoveryTips,
    model,
};
