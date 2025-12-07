# Diet Plan Cuisine Preference - Quick Reference Card

## 🎯 What's New?

Users can now **select their preferred cuisine** before generating AI diet plans:

- **South Indian** (Idli, Dosa, Sambar)
- **North Indian** (Roti, Dal, Curries)
- **Mixed Indian** (Combination)

---

## 📋 User Steps

```
1. Go to Diet Plan page
2. Fill your information
3. SELECT CUISINE PREFERENCE ← NEW!
4. Click Generate
5. Get 3 customized variations
```

---

## 🍽️ Cuisine Details

| Aspect        | South Indian    | North Indian  | Mixed  |
| ------------- | --------------- | ------------- | ------ |
| **Staple**    | Rice, Millets   | Wheat, Roti   | Both   |
| **Oil**       | Coconut, Sesame | Ghee, Mustard | Mixed  |
| **Breakfast** | Idli, Dosa      | Paratha, Poha | Varied |
| **Lunch**     | Sambar, Rice    | Dal, Roti     | Mixed  |
| **Dinner**    | Kanji, Light    | Roti, Khichdi | Light  |
| **Snacks**    | Sundal, Pori    | Chana, Laddoo | Both   |

---

## 🔄 3 Variations Per Cuisine

### Variation 1: Traditional

- Balanced, authentic recipes
- Mix of all food groups
- Moderate portions
- Natural cooking methods

### Variation 2: High-Protein

- Protein: 1.2-1.5g per kg body weight
- High-protein dishes featured
- More protein sources
- Perfect for muscle gain

### Variation 3: Light & Healthy

- Minimal oil, steamed/boiled
- Lower calories
- Easy to digest
- Good for weight loss

---

## 📊 API Request/Response

### Request

```json
POST /api/diet-plan/generate
{
  "currentWeight": 75,
  "targetWeight": 70,
  "height": 175,
  "age": 28,
  "fitnessLevel": "intermediate",
  "goal": "weight-loss",
  "dietaryRestrictions": "",
  "medicalConditions": "",
  "cuisinePreference": "south-indian"  ← NEW
}
```

### Response

```json
{
  "success": true,
  "data": {
    "dietPlans": [
      {"type": "Traditional South Indian", "plan": "..."},
      {"type": "High-Protein South Indian", "plan": "..."},
      {"type": "Light & Healthy South Indian", "plan": "..."}
    ],
    "cuisinePreference": "south-indian"  ← NEW
  }
}
```

---

## ✅ What Works

- ✅ All 3 cuisines generate unique plans
- ✅ No cross-contamination of dishes
- ✅ All 3 variations work perfectly
- ✅ Culturally authentic recipes
- ✅ Proper calorie/macro calculations
- ✅ Clear portion sizes

---

## 🧪 Quick Test

### Test 1: South Indian

Expected: **Only** Idli, Dosa, Sambar, Rasam (NO Roti)

### Test 2: North Indian

Expected: **Only** Roti, Dal, Paneer (NO Idli, Dosa)

### Test 3: Mixed Indian

Expected: **Both** types throughout week (Variety)

### Test 4: High-Protein

Expected: **Extra protein** in each meal (100+ g/day for 75kg)

### Test 5: Light & Healthy

Expected: **Less oil**, more steam/boil, lighter meals

---

## 🐛 Troubleshooting

| Problem            | Solution                       |
| ------------------ | ------------------------------ |
| Field not visible  | Clear cache, refresh page      |
| Still generic plan | Restart backend server         |
| Mixed cuisines     | Check request body in DevTools |
| API timeout        | Try again, check internet      |
| No response        | Verify Gemini API key          |

---

## 📁 Files Modified

```
frontend/pages/diet-plan.html
  ├─ Added cuisine dropdown
  └─ Updated form submission

backend/controllers/diet-plan.controller.js
  ├─ Extract cuisinePreference
  ├─ Route to correct variation
  └─ Return in response

backend/config/gemini.config.js
  ├─ Enhanced generateDietPlanVariation()
  ├─ Added 3 cuisine prompt sections
  └─ Dynamic variation naming
```

---

## 📚 Documentation

- `DIET_PLAN_CUISINE_UPDATE.md` - Full feature details
- `DIET_PLAN_TEST_GUIDE.md` - Testing procedures
- `DIET_PLAN_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `WORKFLOW_1PAGE.md` - Updated workflow

---

## 🚀 Deployment

```bash
# No new dependencies needed
# Just update the 3 files and restart:

backend:  npm start
frontend: npm run dev
```

---

## 💡 Key Differences

### Before

```
Generate Diet Plan
  ↓
Always South Indian
  ↓
User: "But I want North Indian..."
```

### After

```
Select Cuisine
  ↓
Generate Diet Plan
  ↓
Exactly what user wanted! ✓
```

---

## 🎯 Expected Outcomes

**South Indian Selection:**

- Breakfast: Idli, Dosa, Uppma, Pongal, Adai
- Lunch: Rice with Sambar, Rasam, Kootu, Poriyal, Curd
- Dinner: Idli, Kanji, Light Dosa
- Snacks: Sundal, Buttermilk, Makhana

**North Indian Selection:**

- Breakfast: Paratha, Poha, Upma, Daliya, Khichdi
- Lunch: Roti with Dal, Paneer, Aloo Gobi, Rajma, Yogurt
- Dinner: Light Roti, Khichdi
- Snacks: Chana, Laddoos, Poha

**Mixed Indian Selection:**

- Day 1-2: South Indian meals
- Day 3-4: North Indian meals
- Day 5-7: Mix or repeated favorites

---

## 🌟 Benefits

✅ **Personalized** - Matches cultural preferences
✅ **Authentic** - Real regional recipes
✅ **Practical** - Easy to find ingredients
✅ **Flexible** - 3 variations per cuisine
✅ **Accurate** - AI understands regional diets
✅ **Easy** - Simple dropdown selection

---

## 📞 Support

For issues or questions:

1. Check `DIET_PLAN_TEST_GUIDE.md`
2. Review browser console (F12)
3. Check network tab for API response
4. Verify Gemini API key validity
5. Restart backend server

---

**Last Updated:** December 7, 2025
**Version:** 1.0
**Status:** ✅ Ready for Production
