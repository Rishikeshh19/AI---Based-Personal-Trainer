# Quick Test Guide - Diet Plan Cuisine Preference

## How to Test the New Cuisine Preference Feature

### Setup

1. Start backend: `npm start` (port 8000)
2. Start frontend: `npm run dev` (port 5174)
3. Login as a member
4. Navigate to **Diet Plan** page

---

## Test Scenario 1: South Indian Preference ✓

**Steps:**

1. Fill form:
   - Current Weight: 75 kg
   - Target Weight: 70 kg
   - Height: 175 cm
   - Age: 28
   - Fitness Level: Intermediate
   - Goal: Weight Loss
   - **Cuisine Preference: South Indian** ← NEW FIELD
2. Click "Generate My Diet Plan"
3. Wait 30-60 seconds for AI to generate

**Expected Results:**

- ✓ 3 variations generated: Traditional, High-Protein, Light & Healthy
- ✓ ALL meals use only South Indian dishes
- ✓ Contains: Idli, Dosa, Sambar, Rasam, Upma, Pongal, Adai
- ✓ Does NOT contain: Roti, Paratha, Bread, Oatmeal, Western food
- ✓ Uses: Coconut Oil, Sesame Oil, Groundnut Oil
- ✓ Includes: South Indian spices and cooking methods

**Sample Output Check:**

```
Day 1:
Early Morning: Warm water with honey
Breakfast: 2 Idlis with Sambar and Chutney (150 cal)
Mid-Morning Snack: Buttermilk (Neer Mor) (50 cal)
Lunch: 1 cup Rice with Sambar, Poriyal, Curd (350 cal)
...
```

---

## Test Scenario 2: North Indian Preference ✓

**Steps:**

1. Fill form (same as above)
2. **Cuisine Preference: North Indian** ← SELECT THIS
3. Click "Generate My Diet Plan"

**Expected Results:**

- ✓ 3 variations generated: Traditional, High-Protein, Light & Healthy
- ✓ ALL meals use only North Indian dishes
- ✓ Contains: Roti, Paratha, Dal, Paneer Curries, Poha, Khichdi
- ✓ Does NOT contain: Idli, Dosa, Sambar, Rasam, Coconut Oil focus
- ✓ Uses: Wheat, Ghee, Mustard Oil
- ✓ Includes: North Indian spices and cooking methods

**Sample Output Check:**

```
Day 1:
Early Morning: Warm water with lemon
Breakfast: Aloo Paratha with Yogurt (200 cal)
Mid-Morning Snack: Herbal Tea with Roasted Chana (60 cal)
Lunch: 2 Roti with Dal Makhni, Paneer Curry (350 cal)
...
```

---

## Test Scenario 3: Mixed Indian Preference ✓

**Steps:**

1. Fill form (same as above)
2. **Cuisine Preference: Mixed Indian** ← SELECT THIS
3. Click "Generate My Diet Plan"

**Expected Results:**

- ✓ 3 variations generated: Traditional, High-Protein, Light & Healthy
- ✓ Mix of North and South Indian dishes throughout
- ✓ Day 1-2: South Indian (Idli, Dosa, Sambar)
- ✓ Day 3-4: North Indian (Roti, Dal, Curries)
- ✓ Day 5-7: Mixed/Balanced
- ✓ Includes: Different cooking oils and spices
- ✓ Provides: Cultural variety and flexibility

**Sample Output Check:**

```
Day 1: South Indian (Idli, Dosa, Sambar)
Day 2: South Indian (Upma, Rasam)
Day 3: North Indian (Paratha, Dal)
Day 4: North Indian (Roti, Paneer)
Day 5: South Indian (Pongal, Kootu)
...
```

---

## High-Protein Variation Check ✓

**For ANY cuisine preference:**

Look for these indicators in "High-Protein" variation:

- ✓ Protein emphasis in every meal
- ✓ Target: 1.2-1.5g protein per kg body weight
- ✓ Mentions: Sundals, Dals, Paneer, Eggs, Fish
- ✓ Higher protein sources highlighted
- ✓ Calorie count matches macros (high protein %)

**Sample Check:**

```
Protein for 75kg person: 90-112g per day minimum
Check: Total daily protein in plan ~100-110g ✓
```

---

## Light & Healthy Variation Check ✓

**For ANY cuisine preference:**

Look for these indicators:

- ✓ Steamed/boiled preparations emphasized
- ✓ Minimal oil mentioned
- ✓ Lower calories per meal
- ✓ Light evening meals
- ✓ More vegetables, fewer oils

**Sample Check:**

```
Dinner portions: Smaller
Oil quantities: Reduced
Cooking methods: Steam, boil, bake
Vegetables: 50% of meal
```

---

## Validation Checks

### 1. Form Validation

- [ ] Cuisine preference is now REQUIRED field
- [ ] Cannot submit without selecting cuisine
- [ ] Error message if field not filled

### 2. API Request

Open browser DevTools (F12) → Network tab:

```json
Body sent to POST /api/diet-plan/generate:
{
  "currentWeight": 75,
  "targetWeight": 70,
  "height": 175,
  "age": 28,
  "fitnessLevel": "intermediate",
  "goal": "weight-loss",
  "dietaryRestrictions": "",
  "medicalConditions": "",
  "cuisinePreference": "south-indian"
}
```

### 3. API Response

```json
{
  "success": true,
  "data": {
    "dietPlans": [
      {
        "type": "Traditional South Indian",
        "plan": "...",
        "description": "..."
      },
      // ... 2 more variations
    ],
    "userData": {...},
    "generatedAt": "...",
    "totalPlans": 3,
    "cuisinePreference": "south-indian"
  }
}
```

---

## Troubleshooting

### Issue: Cuisine preference field not showing

**Solution:**

1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh page (Ctrl+F5)
3. Check if HTML file was updated

### Issue: Still getting generic diet plan

**Solution:**

1. Check backend logs for errors
2. Ensure backend restarted after code changes
3. Check Gemini API key is valid

### Issue: AI generating mixed cuisine even when South Indian selected

**Solution:**

1. Check request body includes correct `cuisinePreference`
2. Verify backend code change is deployed
3. Check Gemini API response in server logs

### Issue: Timeout generating diet plan

**Solution:**

1. Check internet connection
2. Verify Gemini API key has rate limit available
3. Try again after 1 minute
4. Check if API quota exceeded

---

## Browser DevTools Debugging

### Console Logs to Check:

```javascript
// Open F12 → Console to see:
- Form submission: cuisinePreference value
- API request: Full request body
- API response: dietPlans array
```

### Network Tab to Check:

```
POST /api/diet-plan/generate
Status: 200
Response preview: Should show 3 diet plans
Size: Usually 20-50KB depending on detail
```

---

## Success Criteria ✓

After testing all 3 scenarios:

- [ ] All 3 cuisines generate unique plans
- [ ] No cross-contamination (South Indian doesn't have Roti, etc.)
- [ ] All 3 variations work (Traditional, High-Protein, Light & Healthy)
- [ ] Cuisine preference shows in response
- [ ] Plans are culturally authentic
- [ ] Calorie counts and macros are reasonable
- [ ] Portion sizes are clear and specific
- [ ] No errors in browser console or server logs

---

## Performance Notes

- **Generation Time:** 30-60 seconds (normal)
- **Response Size:** 20-50 KB per generation
- **API Calls:** 3 per generation (one for each variation)
- **Caching:** Not cached (fresh generation each time)

---

## Next Steps After Testing

1. ✓ Verify all cuisine types work correctly
2. ✓ Check response format and structure
3. ✓ Validate calorie and macro calculations
4. ✓ Test with different user profiles
5. ✓ Deploy to production
6. ✓ Monitor Gemini API usage

---

**Test Date:** ******\_\_\_******
**Tester:** ******\_\_\_******
**Status:** ******\_\_\_******
**Notes:** ******\_\_\_******
