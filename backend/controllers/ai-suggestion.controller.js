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
