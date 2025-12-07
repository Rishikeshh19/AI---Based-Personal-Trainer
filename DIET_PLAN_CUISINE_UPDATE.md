# Diet Plan Cuisine Preference Update

## Problem

AI diet plan was not generating based on user's cuisine preference. The backend was hardcoded to only generate South Indian diet plans regardless of user preference.

## Solution

Added **Cuisine Preference Selector** to the diet plan form, allowing users to choose between:

1. **South Indian** (Default) - Idli, Dosa, Sambar, Rasam
2. **North Indian** - Roti, Paratha, Dal, Curries
3. **Mixed Indian** - Combination of both regional styles

---

## Changes Made

### 1. Frontend - `frontend/pages/diet-plan.html`

**Added Cuisine Preference Field:**

```html
<div class="form-group">
  <label for="cuisine-preference"
    ><i class="fas fa-utensils"></i> Cuisine Preference *</label
  >
  <select id="cuisine-preference" required>
    <option value="">Select your preferred cuisine</option>
    <option value="south-indian" selected>
      South Indian (Idli, Dosa, Sambar)
    </option>
    <option value="north-indian">North Indian (Roti, Dal, Curry)</option>
    <option value="mixed-indian">Mixed Indian</option>
  </select>
</div>
```

**Updated Form Submission:**

- Added `cuisinePreference` to form data collection
- Included validation to ensure cuisine preference is selected
- Passes `cuisinePreference` to backend API

### 2. Backend - `backend/controllers/diet-plan.controller.js`

**Updated `generateDietPlan` Function:**

- Extracts `cuisinePreference` from request body
- Defaults to `'south-indian'` if not provided
- Generates different variations based on cuisine type:
  - **South Indian variations**: Traditional, High-Protein, Light & Healthy
  - **North Indian variations**: Traditional, High-Protein, Light & Healthy
  - **Mixed Indian variations**: Traditional, High-Protein, Light & Healthy
- Returns `cuisinePreference` in response

### 3. Backend - `backend/config/gemini.config.js`

**Enhanced `generateDietPlanVariation` Function:**

#### South Indian Cuisine Section:

- Strict focus on rice, millets, and South Indian preparations
- NO Western food (oatmeal, bread, pasta)
- Cooking oils: Coconut, Sesame, Groundnut
- Breakfast: Idli, Dosa, Upma, Pongal, Adai, Pesarattu
- Lunch: Rice with Sambar, Rasam, Kootu, Poriyal, Curd
- Dinner: Light options like Idli, Millet Dosa, Kanji
- Snacks: Sundal, Makhana, Buttermilk, Pori
- Hydration: Warm water, Jeera water, Buttermilk

#### North Indian Cuisine Section:

- Focus on whole wheat roti, chapati, and regional preparations
- Cooking oils: Mustard, Ghee, Refined
- Breakfast: Paratha, Poha, Upma, Daliya, Khichdi
- Lunch: Roti/Chapati with Dal, Curries (Aloo Gobi, Rajma, Paneer)
- Dinner: Light roti or khichdi
- Snacks: Chickpea salad, Roasted chana
- Hydration: Water, herbal teas, juices

#### Mixed Indian Cuisine Section:

- Alternates between North and South Indian styles
- Balanced variety throughout the week
- Mix of cooking methods and regional specialties

#### Variation-Specific Guidance:

- **High-Protein**: Emphasis on protein items from chosen cuisine (1.2-1.5g per kg body weight)
- **Light & Healthy**: Focus on steamed/boiled preparations, minimal oil

---

## API Changes

### Request Body

```json
{
  "currentWeight": 75,
  "targetWeight": 70,
  "height": 175,
  "age": 28,
  "fitnessLevel": "intermediate",
  "goal": "weight-loss",
  "dietaryRestrictions": "vegetarian",
  "medicalConditions": "",
  "cuisinePreference": "south-indian"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "dietPlans": [
      {
        "type": "Traditional South Indian",
        "plan": "7-day diet plan...",
        "description": "Traditional South Indian approach..."
      },
      // ... more variations
    ],
    "userData": {...},
    "generatedAt": "2024-12-07T...",
    "totalPlans": 3,
    "cuisinePreference": "south-indian"
  }
}
```

---

## How to Use

### User Steps:

1. Go to **Diet Plan** page
2. Fill in your information:
   - Current Weight, Target Weight
   - Height, Age
   - Fitness Level, Goal
   - Dietary Restrictions (optional)
   - Medical Conditions (optional)
3. **NEW:** Select your preferred cuisine:
   - South Indian (Default)
   - North Indian
   - Mixed Indian
4. Click **"Generate My Diet Plan"**
5. AI generates 3 personalized variations matching your cuisine preference

### What You'll Get:

- **3 diet plan variations** for your chosen cuisine
- **7-day detailed meal plan** with:
  - Breakfast, Lunch, Dinner, Snacks
  - Calorie counts per meal
  - Macronutrient breakdown (Protein, Carbs, Fats)
  - Portion sizes in familiar terms
- **Culturally authentic** recipes and suggestions
- **Personalized** to your fitness level and goals

---

## Cuisine Details

### South Indian 🥘

- **States:** Tamil Nadu, Kerala, Karnataka, Andhra/Telangana
- **Staples:** Rice, Millets, Coconut, Sesame Oil
- **Famous Dishes:** Idli, Dosa, Sambar, Rasam, Uttapam, Pongal
- **Best For:** Those who enjoy fermented foods and milder preparations

### North Indian 🍛

- **States:** Punjab, Uttar Pradesh, Rajasthan, Delhi, Himachal Pradesh
- **Staples:** Wheat, Roti, Ghee, Mustard Oil
- **Famous Dishes:** Paratha, Roti, Dal, Paneer Curries, Raj Kachori
- **Best For:** Those who prefer bread-based meals and richer curries

### Mixed Indian 🥗

- **Combination:** Best of both regions
- **Flexibility:** Variety and change throughout the week
- **Best For:** Those who like exploring different regional cuisines

---

## Testing the Feature

### Test Case 1: South Indian Preference

```
Cuisine: South Indian
Expected: 7-day plan with Idli, Dosa, Sambar, Rasam only
Should NOT include: Roti, Bread, Oatmeal
```

### Test Case 2: North Indian Preference

```
Cuisine: North Indian
Expected: 7-day plan with Roti, Paratha, Dal, Curries
Should NOT include: Idli, Dosa, Sambar
```

### Test Case 3: Mixed Indian Preference

```
Cuisine: Mixed Indian
Expected: Combination of South and North Indian dishes
Should have: Variety throughout the week
```

---

## Benefits

✅ **Personalized:** Matches user's cultural food preferences
✅ **Authentic:** Uses region-specific ingredients and cooking methods
✅ **Practical:** Easy to find ingredients locally
✅ **Flexible:** 3 variations for different goals (High-Protein, Light & Healthy)
✅ **Smart:** AI understands regional cuisines and their nutritional profiles
✅ **Accessible:** No language barriers - all in English with familiar dishes

---

## Future Enhancements

1. **Dietary Restrictions Integration:**

   - Jain (No onion/garlic, root vegetables)
   - Satvik (Pure vegetarian, no spices)
   - Vegan options
   - Gluten-free

2. **Regional Preferences:**

   - Add East Indian (Bengali, Odia)
   - Add West Indian (Maharashtrian, Gujarati)
   - Add Northeast Indian (Assamese, Manipuri)

3. **Meal Prep:**

   - Shopping list generation
   - Prep time estimates
   - Batch cooking suggestions

4. **Calorie Tracking:**
   - Integration with fitness tracking
   - Weekly progress monitoring
   - Macro adjustment recommendations

---

## Backend Configuration

**Model:** Gemini 1.5 Flash
**Temperature:** 0.7 (Balanced creativity and consistency)
**Max Tokens:** 2048 (Enough for detailed 7-day plan)
**Response Format:** Detailed, structured, section-based

---

## Status

✅ **Feature Complete and Tested**

- Frontend form updated ✓
- Backend controller enhanced ✓
- Gemini prompts optimized ✓
- All 3 cuisine types supported ✓
- 3 variations per cuisine ✓

**Ready for:** Production deployment, user testing

---

**Last Updated:** December 7, 2025
**Version:** 1.0
