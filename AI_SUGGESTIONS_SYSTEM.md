# AI Suggestions System Architecture

## Overview

The AI Suggestions feature provides personalized fitness recommendations based on user profile and workout history. It does **NOT** use external AI APIs (like ChatGPT or OpenAI). Instead, it uses **rule-based algorithms** that analyze user data locally.

## How It Works

### 1. **Backend Logic** (`backend/controllers/ai-suggestion.controller.js`)

The backend generates suggestions using three main functions:

#### A. **Workout Suggestions** (`generateWorkoutSuggestions`)

- Analyzes user's **fitness level** (beginner, intermediate, advanced)
- Considers user's **goals** (weight loss, muscle gain, etc.)
- Returns recommended exercises tailored to the user
- Provides workout tips specific to their level

**Logic:**

```
IF fitness_level == "beginner"
  → Recommend: Walking, Bodyweight Squats, Modified Push-ups
  → Tips: Focus on form, rest 48hrs, stay hydrated

IF fitness_level == "intermediate"
  → Recommend: Running, Weighted Squats, Pull-ups, Plank
  → Tips: Progressive overload, mix cardio & strength

IF fitness_level == "advanced"
  → Recommend: HIIT, Deadlifts, Weighted Pull-ups
  → Tips: Periodization, adequate recovery
```

#### B. **Nutrition Advice** (`generateNutritionAdvice`)

- Calculates **daily calorie needs** based on weight
- Adjusts **macronutrient ratios** based on goals
- Provides goal-specific nutrition tips

**Calculations:**

```
Base Calories = Weight (kg) × 24

Weight Loss Goal:
  - Daily Calories = Base × 0.85 (15% deficit)
  - Protein: Weight × 2g
  - Carbs: 30% of calories
  - Fats: 30% of calories

Muscle Gain Goal:
  - Daily Calories = Base × 1.15 (15% surplus)
  - Protein: Weight × 2.2g
  - Carbs: 40% of calories
  - Fats: 25% of calories
```

#### C. **Recovery Tips** (`generateRecoveryTips`)

- Provides sleep recommendations
- Suggests active recovery exercises
- Recommends nutrition timing
- Advanced tips for expert level users

**Categories:**

- Sleep: 7-9 hours, consistent schedule
- Active Recovery: Light walking, yoga, foam rolling
- Nutrition: Post-workout protein, hydration
- General: HRV monitoring, deload weeks

### 2. **API Endpoints**

```
GET /api/ai-suggestions/workout     → Workout suggestions
GET /api/ai-suggestions/nutrition   → Nutrition advice
GET /api/ai-suggestions/recovery    → Recovery tips
GET /api/ai-suggestions/member/:id  → All suggestions for a member
```

### 3. **Frontend Implementation**

**File:** `frontend/pages/ai-suggestions.html`

- Displays suggestions in an organized, user-friendly format
- Shows member profile info
- Allows filtering by suggestion type
- Real-time updates based on user data

**Data Flow:**

```
Frontend (ai-suggestions.html)
    ↓
API Call (api.getAISuggestions)
    ↓
Backend Route (/api/ai-suggestions)
    ↓
Controller (ai-suggestion.controller.js)
    ↓
Generate Suggestions (Rule-Based)
    ↓
Return JSON Response
    ↓
Frontend Displays Results
```

## Data Sources for Suggestions

The system analyzes:

1. **User Profile Data**

   - Fitness level
   - Goals (weight loss, muscle gain, etc.)
   - Weight/height
   - Age

2. **Workout History**

   - Recent workouts (last 10)
   - Exercise frequency
   - Workout patterns

3. **Performance Metrics**
   - Completion rate
   - Exercise progression

## Example Response

```json
{
  "success": true,
  "data": {
    "recommended": [
      {
        "exercise": "Running",
        "duration": 30,
        "intensity": "moderate",
        "type": "cardio"
      },
      {
        "exercise": "Weighted Squats",
        "sets": 4,
        "reps": 12,
        "type": "strength"
      }
    ],
    "tips": [
      "Incorporate progressive overload into your routine",
      "Mix cardio and strength training throughout the week",
      "Consider adding HIIT sessions for better results"
    ]
  }
}
```

## Key Features

✅ **Rule-Based AI** - Uses if/else logic, not machine learning
✅ **Privacy-Focused** - All processing done locally on backend
✅ **Personalized** - Adapts to user profile and history
✅ **Real-Time** - Generates suggestions on-demand
✅ **Scalable** - No external API dependencies

## Limitations

⚠️ Not machine learning-based
⚠️ Uses simplified calorie calculations
⚠️ Generic suggestions (not ultra-personalized)
⚠️ No advanced biometric tracking (HRV, VO2 max, etc.)

## Future Enhancements

🔮 **Could integrate with:**

- OpenAI API for advanced recommendations
- Google's Generative AI for dynamic suggestions
- Machine Learning models for pattern detection
- Wearable data integration (heart rate, sleep)

## How to Use

1. **Navigate to:** AI Suggestions page
2. **View:** Recommendations based on your profile
3. **Follow:** Tips and exercise recommendations
4. **Update:** Profile info to get better suggestions
5. **Track:** Progress with workouts

## Technical Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Algorithm:** Rule-based (JavaScript)
- **Frontend:** Vanilla JavaScript + HTML/CSS

## Files Involved

- `backend/controllers/ai-suggestion.controller.js`
- `backend/routes/ai-suggestion.routes.js`
- `frontend/pages/ai-suggestions.html`
- `frontend/js/api.js`

---

**Status:** ✅ Fully Functional
**API Based:** ❌ No (Rule-Based System)
**Real-Time:** ✅ Yes
**Personalized:** ✅ Yes
