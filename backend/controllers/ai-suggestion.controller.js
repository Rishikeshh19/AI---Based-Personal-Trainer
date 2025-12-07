const Workout = require('../models/Workout');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');
const geminiService = require('../config/gemini.config');

// @desc    Get AI workout suggestions
// @route   GET /api/ai-suggestions/workout
// @access  Private
exports.getWorkoutSuggestions = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // Get recent workouts to analyze patterns
    const recentWorkouts = await Workout.find({ user: req.user.id })
        .sort({ date: -1 })
        .limit(10);

    try {
        // Try to use Gemini API first
        const userData = {
            fitnessLevel: user.profile?.fitnessLevel || 'beginner',
            goals: user.profile?.goals || [],
            age: user.profile?.age,
            weight: user.profile?.weight,
            recentWorkouts: recentWorkouts.map(w => ({
                name: w.name,
                date: w.date,
            })),
        };

        logger.info(`Generating AI workout suggestions for user: ${user.email}`);
        const aiSuggestions = await geminiService.generateWorkoutSuggestions(userData);

        res.status(200).json({
            success: true,
            data: {
                suggestions: aiSuggestions,
                source: 'gemini-ai',
            }
        });
    } catch (error) {
        logger.error(`Gemini API error, falling back to rule-based: ${error.message}`);

        // Fallback to rule-based suggestions
        const suggestions = generateWorkoutSuggestions(user, recentWorkouts);

        res.status(200).json({
            success: true,
            data: {
                ...suggestions,
                source: 'rule-based',
                note: 'AI service temporarily unavailable, using rule-based suggestions',
            }
        });
    }
});

// @desc    Get AI nutrition advice
// @route   GET /api/ai-suggestions/nutrition
// @access  Private
exports.getNutritionAdvice = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    try {
        const userData = {
            weight: user.profile?.weight,
            height: user.profile?.height,
            age: user.profile?.age,
            goals: user.profile?.goals || [],
            fitnessLevel: user.profile?.fitnessLevel,
        };

        logger.info(`Generating AI nutrition advice for user: ${user.email}`);
        const aiAdvice = await geminiService.generateNutritionAdvice(userData);

        res.status(200).json({
            success: true,
            data: {
                advice: aiAdvice,
                source: 'gemini-ai',
            }
        });
    } catch (error) {
        logger.error(`Gemini API error, falling back to rule-based: ${error.message}`);

        const advice = generateNutritionAdvice(user);

        res.status(200).json({
            success: true,
            data: {
                ...advice,
                source: 'rule-based',
                note: 'AI service temporarily unavailable, using rule-based advice',
            }
        });
    }
});

// @desc    Get AI recovery tips
// @route   GET /api/ai-suggestions/recovery
// @access  Private
exports.getRecoveryTips = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    try {
        const userData = {
            fitnessLevel: user.profile?.fitnessLevel,
            age: user.profile?.age,
        };

        logger.info(`Generating AI recovery tips for user: ${user.email}`);
        const aiTips = await geminiService.generateRecoveryTips(userData);

        res.status(200).json({
            success: true,
            data: {
                tips: aiTips,
                source: 'gemini-ai',
            }
        });
    } catch (error) {
        logger.error(`Gemini API error, falling back to rule-based: ${error.message}`);

        const tips = generateRecoveryTips(user);

        res.status(200).json({
            success: true,
            data: {
                ...tips,
                source: 'rule-based',
                note: 'AI service temporarily unavailable, using rule-based tips',
            }
        });
    }
});

// Helper function to generate workout suggestions
function generateWorkoutSuggestions(user, recentWorkouts) {
    const fitnessLevel = user.profile?.fitnessLevel || 'beginner';
    const goals = user.profile?.goals || [];

    const suggestions = {
        recommended: [],
        tips: []
    };

    // Base suggestions on fitness level
    if (fitnessLevel === 'beginner') {
        suggestions.recommended.push(
            { exercise: 'Walking', duration: 30, intensity: 'low', type: 'cardio' },
            { exercise: 'Bodyweight Squats', sets: 3, reps: 10, type: 'strength' },
            { exercise: 'Push-ups (modified)', sets: 3, reps: 8, type: 'strength' }
        );
        suggestions.tips.push(
            'Start slow and focus on proper form',
            'Rest at least 48 hours between strength training sessions',
            'Stay hydrated throughout your workout'
        );
    } else if (fitnessLevel === 'intermediate') {
        suggestions.recommended.push(
            { exercise: 'Running', duration: 30, intensity: 'moderate', type: 'cardio' },
            { exercise: 'Weighted Squats', sets: 4, reps: 12, type: 'strength' },
            { exercise: 'Pull-ups', sets: 3, reps: 8, type: 'strength' },
            { exercise: 'Plank', duration: 60, type: 'core' }
        );
        suggestions.tips.push(
            'Incorporate progressive overload into your routine',
            'Mix cardio and strength training throughout the week',
            'Consider adding HIIT sessions for better results'
        );
    } else {
        suggestions.recommended.push(
            { exercise: 'HIIT Running', duration: 45, intensity: 'high', type: 'cardio' },
            { exercise: 'Deadlifts', sets: 5, reps: 5, type: 'strength' },
            { exercise: 'Weighted Pull-ups', sets: 4, reps: 10, type: 'strength' },
            { exercise: 'Advanced Core Circuit', duration: 20, type: 'core' }
        );
        suggestions.tips.push(
            'Focus on periodization in your training',
            'Ensure adequate recovery between intense sessions',
            'Consider working with a trainer for advanced techniques'
        );
    }

    // Add goal-specific suggestions
    if (goals.includes('weight loss')) {
        suggestions.tips.push('Maintain a caloric deficit while ensuring adequate protein intake');
        suggestions.recommended.push({ exercise: 'Jump Rope', duration: 15, intensity: 'high', type: 'cardio' });
    }
    if (goals.includes('muscle gain')) {
        suggestions.tips.push('Increase protein intake to 1.6-2.2g per kg of body weight');
        suggestions.recommended.push({ exercise: 'Compound Lifts', sets: 5, reps: 5, type: 'strength' });
    }

    return suggestions;
}

// Helper function to generate nutrition advice
function generateNutritionAdvice(user) {
    const goals = user.profile?.goals || [];
    const weight = user.profile?.weight || 70;

    const advice = {
        dailyCalories: 2000,
        macros: {},
        tips: []
    };

    // Calculate basic calorie needs (simplified)
    const baseCalories = weight * 24; // Very basic calculation

    if (goals.includes('weight loss')) {
        advice.dailyCalories = Math.round(baseCalories * 0.85);
        advice.macros = {
            protein: Math.round(weight * 2),
            carbs: Math.round(advice.dailyCalories * 0.3 / 4),
            fats: Math.round(advice.dailyCalories * 0.3 / 9)
        };
        advice.tips.push(
            'Maintain a moderate caloric deficit',
            'Prioritize protein to preserve muscle mass',
            'Stay hydrated - drink at least 2-3 liters of water daily'
        );
    } else if (goals.includes('muscle gain')) {
        advice.dailyCalories = Math.round(baseCalories * 1.15);
        advice.macros = {
            protein: Math.round(weight * 2.2),
            carbs: Math.round(advice.dailyCalories * 0.4 / 4),
            fats: Math.round(advice.dailyCalories * 0.25 / 9)
        };
        advice.tips.push(
            'Eat in a slight caloric surplus',
            'Consume protein throughout the day',
            'Time your carbs around workouts for best results'
        );
    } else {
        advice.dailyCalories = Math.round(baseCalories);
        advice.macros = {
            protein: Math.round(weight * 1.6),
            carbs: Math.round(advice.dailyCalories * 0.4 / 4),
            fats: Math.round(advice.dailyCalories * 0.3 / 9)
        };
        advice.tips.push(
            'Maintain a balanced diet',
            'Include plenty of fruits and vegetables',
            'Stay consistent with your eating patterns'
        );
    }

    return advice;
}

// Helper function to generate recovery tips
function generateRecoveryTips(user) {
    const fitnessLevel = user.profile?.fitnessLevel || 'beginner';

    const tips = {
        sleep: [],
        active_recovery: [],
        nutrition: [],
        general: []
    };

    tips.sleep.push(
        'Aim for 7-9 hours of quality sleep per night',
        'Maintain a consistent sleep schedule',
        'Avoid screens 1 hour before bedtime'
    );

    tips.active_recovery.push(
        'Include light walking or yoga on rest days',
        'Try foam rolling to reduce muscle soreness',
        'Consider stretching for 10-15 minutes daily'
    );

    tips.nutrition.push(
        'Consume protein within 2 hours post-workout',
        'Stay hydrated throughout the day',
        'Include anti-inflammatory foods like berries and fatty fish'
    );

    tips.general.push(
        'Listen to your body - rest when needed',
        'Ice sore muscles for 15-20 minutes if needed',
        'Consider massage or other recovery modalities'
    );

    if (fitnessLevel === 'advanced' || fitnessLevel === 'expert') {
        tips.general.push(
            'Monitor your heart rate variability (HRV)',
            'Consider deload weeks every 4-6 weeks',
            'Track your recovery metrics consistently'
        );
    }

    return tips;
}

// @desc    Generate personalized AI suggestions with real LLM
// @route   POST /api/ai-suggestions/personalized
// @access  Private
exports.getPersonalizedSuggestions = asyncHandler(async (req, res, next) => {
    try {
        const {
            currentWeight,
            height,
            age,
            fitnessLevel,
            fitnessGoal,
            medicalConditions
        } = req.body;

        // Validate required fields
        if (!currentWeight || !height || !age || !fitnessLevel || !fitnessGoal) {
            return next(new ErrorResponse('Missing required fields', 400));
        }

        // Create fitness-level-specific prompt
        const prompt = generateFitnessSpecificPrompt(
            currentWeight,
            height,
            age,
            fitnessLevel,
            fitnessGoal,
            medicalConditions
        );

        logger.info(`Generating personalized AI suggestions for fitness level: ${fitnessLevel}, goal: ${fitnessGoal}`);
        
        // Call Gemini API
        const aiSuggestions = await geminiService.generateContent(prompt);

        // Parse and structure the response
        const structuredSuggestions = parseAISuggestions(aiSuggestions, fitnessLevel, fitnessGoal);

        res.status(200).json({
            success: true,
            data: {
                suggestions: aiSuggestions,
                structured: structuredSuggestions,
                fitnessLevel,
                fitnessGoal,
                source: 'gemini-ai',
                generatedAt: new Date(),
            }
        });
    } catch (error) {
        logger.error(`AI Suggestions Generation Error: ${error.message}`);
        
        // Fallback response
        res.status(200).json({
            success: true,
            data: {
                suggestions: generateFallbackSuggestions(req.body),
                source: 'fallback',
                note: 'AI service temporarily unavailable, using rule-based suggestions',
            }
        });
    }
});

// Generate fitness-level-specific prompt
function generateFitnessSpecificPrompt(currentWeight, height, age, fitnessLevel, fitnessGoal, medicalConditions) {
    let basePrompt = `You are an expert personal trainer and fitness coach. Provide comprehensive, personalized fitness improvement suggestions for someone with the following profile:

**User Profile:**
- Age: ${age} years
- Weight: ${currentWeight} kg
- Height: ${height} cm
- Current Fitness Level: ${fitnessLevel}
- Main Goal: ${fitnessGoal}
${medicalConditions ? `- Medical Conditions/Injuries: ${medicalConditions}` : ''}

`;

    // Add fitness-level-specific guidance
    if (fitnessLevel === 'beginner') {
        basePrompt += `**BEGINNER LEVEL FOCUS:**
You are training a beginner who is NEW to fitness. Focus on:
1. **Foundation Building** - Start with basic movements and light intensity
2. **Form and Technique** - Emphasize perfect form over heavy weights
3. **Consistency Over Intensity** - Build the habit of regular exercise
4. **Injury Prevention** - Focus on proper warm-up and cool-down

Please provide:
1. **Beginner-Friendly Workout Plan** (3-4 days/week, 30-40 mins each)
   - 5-6 basic exercises with detailed form cues
   - Sets and reps: 3 sets x 10-12 reps (light weight)
   - Rest days: 1-2 days between sessions
   - Focus on compound movements (squats, push-ups, rows)

2. **Nutrition Guide for Beginners**
   - Daily calorie target: ${calculateCalories(currentWeight, 'beginner', fitnessGoal)} calories
   - Macro split recommendation (% of calories)
   - 5-6 simple meal ideas per day
   - Emphasis on whole foods, avoid complex diet plans

3. **Recovery & Lifestyle**
   - Sleep recommendations (8-9 hours)
   - Basic stretching routine (5 mins daily)
   - Hydration targets

4. **Common Beginner Mistakes to Avoid**
   - Doing too much too soon
   - Poor form chasing heavy weights
   - Skipping warm-up and cool-down
   - Not eating enough protein

5. **Progress Tracking**
   - How to track workouts (reps/weight)
   - Monthly progress checks
   - Expected results timeline: 4-6 weeks to see noticeable changes

6. **Motivational Tips**
   - Building the fitness habit
   - Overcoming initial soreness
   - Setting achievable milestones`;
    } else if (fitnessLevel === 'intermediate') {
        basePrompt += `**INTERMEDIATE LEVEL FOCUS:**
You are training someone with 6-12 months of consistent fitness experience. They know basics and can handle moderate intensity. Focus on:
1. **Progressive Overload** - Gradually increase weight, reps, or intensity
2. **Periodization** - Vary workout structure to prevent plateaus
3. **Advanced Form Variations** - Add complexity to exercises
4. **Performance Metrics** - Track strength and endurance gains

Please provide:
1. **Intermediate Workout Plan** (4-5 days/week, 45-60 mins each)
   - Split routine (Upper/Lower or Push/Pull/Legs)
   - 6-8 exercises per session
   - Higher volume: 4 sets x 8-12 reps with moderate-heavy weight
   - Progressive overload strategy (add weight each week)
   - Include compound + isolation exercises

2. **Optimized Nutrition Plan**
   - Daily calorie target: ${calculateCalories(currentWeight, 'intermediate', fitnessGoal)} calories
   - Advanced macro timing (pre/post-workout nutrition)
   - 7-8 varied meal ideas
   - Supplement recommendations (whey, creatine if applicable)
   - Meal prep strategies

3. **Advanced Recovery & Conditioning**
   - Active recovery days and techniques
   - Foam rolling and stretching (10-15 mins)
   - Sleep optimization strategies
   - Stress management for better recovery

4. **Avoiding Plateaus**
   - Signs of plateau and how to break through
   - Deload weeks strategy
   - Changing exercise variations
   - Adjusting volume and intensity

5. **Performance Goals**
   - Specific metrics to track (strength, endurance, muscle)
   - Realistic 12-week progress expectations
   - Performance benchmarks for this level

6. **Weekly Schedule Example**
   - Detailed day-by-day workout plan
   - Recommended rest days
   - Flexibility in structure`;
    } else {
        // Advanced/Athlete level
        basePrompt += `**ADVANCED/ATHLETE LEVEL FOCUS:**
You are training an advanced fitness enthusiast or athlete with 2+ years of consistent training. Focus on:
1. **Periodized Training** - Structured phases for specific goals
2. **Advanced Techniques** - Drop sets, supersets, RPE training, etc.
3. **Peak Performance** - Optimize for competition or specific events
4. **Injury Prevention & Longevity** - Maintain health while training hard

Please provide:
1. **Advanced Periodized Workout Plan** (5-6 days/week, 60-90 mins each)
   - Periodized structure (Hypertrophy/Strength/Power phases)
   - 8-10 exercises per session
   - Advanced rep ranges and techniques (3-5 reps for strength, 8-15 for hypertrophy)
   - Progressive overload with advanced metrics (RPE, Rate of Perceived Exertion)
   - Include accessory work and weak point training

2. **Elite Nutrition Plan**
   - Daily calorie target: ${calculateCalories(currentWeight, 'advanced', fitnessGoal)} calories
   - Precise macro cycling (high on training days, lower on rest days)
   - Nutrient timing for peak performance
   - 9-10 diverse meals with supplement stack
   - Recovery nutrition strategies
   - Hydration and electrolyte management

3. **Performance Science & Tracking**
   - Detailed metrics to track (strength, power, body composition)
   - Heart rate variability (HRV) monitoring
   - Biomarkers to watch
   - Recovery metrics and readiness assessment

4. **Advanced Recovery Modalities**
   - Mobility work (20-30 mins)
   - Deload week protocols (every 4-6 weeks)
   - Active recovery strategies
   - Sleep optimization (9-10 hours quality sleep)
   - Sauna, ice bath, compression therapy

5. **Goal-Specific Advanced Strategies**
   - ${fitnessGoal === 'weight-loss' ? 'Advanced body composition optimization, maintaining muscle while losing fat, strategic calorie cycling' : 
       fitnessGoal === 'muscle-gain' ? 'Hypertrophy-focused periodization, progressive overload, nutrient partitioning' :
       fitnessGoal === 'strength' ? 'Strength periodization, neural adaptation, competition prep' :
       'Sport-specific conditioning and performance enhancement'}
   
6. **Quarterly Progression Plan**
   - 3-month detailed timeline
   - Expected performance gains
   - Periodic assessment protocols
   - Adjustment strategies based on results`;
    }

    basePrompt += `

**IMPORTANT FORMAT:**
- Use clear sections with headers
- Include specific numbers and timelines
- Make recommendations actionable and specific
- Consider the user's ${fitnessGoal} goal throughout
- Provide both "Do This" and "Avoid This" lists
- Include realistic expectations based on their level`;

    return basePrompt;
}

// Helper to calculate personalized calories
function calculateCalories(weight, level, goal) {
    const baseCalories = weight * 24;
    
    if (goal === 'weight-loss') {
        if (level === 'beginner') return Math.round(baseCalories * 0.85);
        if (level === 'intermediate') return Math.round(baseCalories * 0.80);
        return Math.round(baseCalories * 0.75);
    } else if (goal === 'muscle-gain') {
        if (level === 'beginner') return Math.round(baseCalories * 1.10);
        if (level === 'intermediate') return Math.round(baseCalories * 1.15);
        return Math.round(baseCalories * 1.20);
    } else {
        return Math.round(baseCalories);
    }
}

// Parse AI suggestions into structured format
function parseAISuggestions(aiResponse, fitnessLevel, goal) {
    return {
        rawResponse: aiResponse,
        fitnessLevel: fitnessLevel,
        goal: goal,
        sections: extractSections(aiResponse),
        summary: extractSummary(aiResponse),
    };
}

function extractSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = 'general';
    
    for (const line of lines) {
        if (line.includes('**') && line.includes(':')) {
            const match = line.match(/\*\*(.*?)\*\*/);
            if (match) {
                currentSection = match[1].toLowerCase().replace(/\s+/g, '_');
                sections[currentSection] = [];
            }
        } else if (line.trim()) {
            if (!sections[currentSection]) sections[currentSection] = [];
            sections[currentSection].push(line);
        }
    }
    
    return sections;
}

function extractSummary(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.slice(0, 5).join(' ');
}

// Fallback suggestions if LLM fails
function generateFallbackSuggestions(formData) {
    const { fitnessLevel, fitnessGoal } = formData;
    
    const fallbackMaps = {
        beginner: {
            'weight-loss': 'Start with 3-4 days/week of 30-40 min workouts combining walking/light cardio and bodyweight exercises. Focus on consistency over intensity.',
            'muscle-gain': 'Begin with 3 days/week of basic strength training focusing on compound movements. Increase protein intake and eat in a caloric surplus.',
            'strength': 'Do 3 days/week of full-body strength workouts with lighter weight and perfect form focus.',
            'default': 'Start with 3-4 days of moderate activity per week, focusing on building the exercise habit.'
        },
        intermediate: {
            'weight-loss': 'Follow a 4-5 day split with 45-60 min sessions. Combine cardio and strength training. Create a 300-500 calorie daily deficit.',
            'muscle-gain': 'Use an Upper/Lower split 4-5 days/week. Progressive overload with 8-12 rep ranges. Eat 300-500 calories above maintenance.',
            'strength': 'Follow a Push/Pull/Legs split with heavy compound focus, 4-5 days/week.',
            'default': 'Mix strength and cardio in a 4-5 day weekly routine with moderate intensity.'
        },
        advanced: {
            'weight-loss': 'Use periodized training with higher volume. Combine heavy strength days with moderate caloric deficit. Track macros precisely.',
            'muscle-gain': 'Hypertrophy-focused periodization with 5-6 days/week. High volume, 8-15 rep ranges. Significant caloric surplus.',
            'strength': 'Periodized strength with 5-6 days/week including competition lifts and accessories.',
            'default': 'Advanced periodization with 5-6 training days, specific goal-focused programming.'
        }
    };
    
    const levelMap = fallbackMaps[fitnessLevel] || fallbackMaps['intermediate'];
    const suggestion = levelMap[fitnessGoal] || levelMap['default'];
    
    return suggestion;
}
