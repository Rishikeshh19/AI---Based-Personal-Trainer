# Diet Plan Cuisine Preference - Visual Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│           AI DIET PLAN WITH CUISINE PREFERENCE                 │
└─────────────────────────────────────────────────────────────────┘

                      ┌──────────────────┐
                      │  User Selects    │
                      │ Cuisine Type     │
                      └────────┬─────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼────┐  ┌──────▼────┐  ┌────▼──────┐
        │   South    │  │   North   │  │  Mixed    │
        │  Indian    │  │  Indian   │  │  Indian   │
        └───────┬────┘  └──────┬────┘  └────┬──────┘
                │              │             │
         ┌──────┴──────────────┴─────────────┴──────┐
         │   Backend Generates 3 Variations        │
         ├──────────────────────────────────────────┤
         │ 1. Traditional                           │
         │ 2. High-Protein                          │
         │ 3. Light & Healthy                       │
         └──────────────────┬──────────────────────┘
                            │
                     ┌──────▼──────┐
                     │ Gemini API  │
                     │  Processes  │
                     │   Prompts   │
                     └──────┬──────┘
                            │
                  ┌─────────▼─────────┐
                  │  3 Customized     │
                  │ Diet Plan         │
                  │  Variations       │
                  └─────────┬─────────┘
                            │
                     ┌──────▼──────┐
                     │   User Gets │
                     │  Perfect    │
                     │   Plans ✓   │
                     └─────────────┘
```

---

## 🍽️ Cuisine Types Comparison

### SOUTH INDIAN 🥘

```
┌─────────────────────────────────┐
│     SOUTH INDIAN CUISINE        │
├─────────────────────────────────┤
│ Region: South India             │
│ Staple: Rice, Millets           │
│ Oil: Coconut, Sesame, Groundnut │
│                                 │
│ 🍜 BREAKFAST                    │
│  • Idli with Sambar & Chutney   │
│  • Dosa (Plain/Masala)          │
│  • Upma, Pongal, Adai           │
│  • Ragi Malt                    │
│                                 │
│ 🍲 LUNCH                        │
│  • Rice (White/Brown/Red)       │
│  • Sambar, Rasam, Kootu         │
│  • Poriyal, Avial, Thoran       │
│  • Curd, Buttermilk             │
│                                 │
│ 🍚 DINNER                       │
│  • Idli, Light Dosa             │
│  • Kanji (Rice Porridge)        │
│  • Uthappam                     │
│                                 │
│ 🥗 SNACKS                       │
│  • Sundal (Chickpea Salad)      │
│  • Pori (Puffed Rice)           │
│  • Buttermilk, Makhana          │
│  • Boiled Peanuts              │
└─────────────────────────────────┘
```

### NORTH INDIAN 🥘

```
┌─────────────────────────────────┐
│    NORTH INDIAN CUISINE         │
├─────────────────────────────────┤
│ Region: North India             │
│ Staple: Wheat, Roti             │
│ Oil: Ghee, Mustard, Refined     │
│                                 │
│ 🍜 BREAKFAST                    │
│  • Paratha (Aloo/Plain)         │
│  • Poha, Upma, Daliya           │
│  • Khichdi, Oats                │
│  • Stuffed Aloo Parathas        │
│                                 │
│ 🍲 LUNCH                        │
│  • Roti, Chapati, Naan          │
│  • White/Basmati Rice           │
│  • Dal (Tadka, Makhni)          │
│  • Paneer, Aloo Gobi, Rajma     │
│  • Yogurt, Lassi                │
│                                 │
│ 🍚 DINNER                       │
│  • Light Roti                   │
│  • Khichdi, Light Dal           │
│  • Steamed Vegetables           │
│                                 │
│ 🥗 SNACKS                       │
│  • Roasted Chickpea             │
│  • Laddoos, Poha                │
│  • Homemade Sweets              │
│  • Nuts, Seeds                  │
└─────────────────────────────────┘
```

### MIXED INDIAN 🥗

```
┌─────────────────────────────────┐
│    MIXED INDIAN CUISINE         │
├─────────────────────────────────┤
│ Both North and South             │
│ Varied throughout week           │
│ Maximum flexibility              │
│                                 │
│ 📅 WEEKLY PATTERN               │
│                                 │
│ DAY 1-2: South Indian           │
│ • Idli, Dosa, Sambar            │
│ • Rice with Sambar              │
│                                 │
│ DAY 3-4: North Indian           │
│ • Paratha, Roti, Dal            │
│ • Wheat-based meals             │
│                                 │
│ DAY 5-7: Mix or Favorites       │
│ • User's preferred combination  │
│ • Variety and change            │
│                                 │
│ ✓ Best for: Variety seekers     │
│ ✓ Maximum flexibility           │
│ ✓ Never boring                  │
└─────────────────────────────────┘
```

---

## 📊 3 Variations Per Cuisine

```
ANY CUISINE (South/North/Mixed)
        │
        ├─── VARIATION 1: TRADITIONAL ───┐
        │                                 │
        │  Balanced Approach              │
        │  • Mix of all food groups       │
        │  • Moderate portions            │
        │  • Natural cooking methods      │
        │  • Variety of dishes            │
        │  • Culturally authentic         │
        │                                 │
        ├─── VARIATION 2: HIGH-PROTEIN ──┤
        │                                 │
        │  Protein Focus                  │
        │  • 1.2-1.5g protein per kg      │
        │  • High-protein dishes featured │
        │  • More protein sources         │
        │  • Perfect for muscle gain      │
        │  • Strength building focus      │
        │                                 │
        └─── VARIATION 3: LIGHT & HEALTHY─┘

           Light & Easy
           • Steamed/boiled preparations
           • Minimal oil usage
           • Lower calories
           • Easy to digest
           • Perfect for weight loss
```

---

## 🔄 User Journey

```
START: User opens Diet Plan page
  │
  ├─ STEP 1: Enter Personal Information ✓
  │  • Weight, Height, Age
  │  • Fitness Level, Goals
  │  • Restrictions, Medical Conditions
  │
  ├─ STEP 2: Select Cuisine Preference ✓ NEW!
  │  ┌─────────────────────────────────┐
  │  │ Select your preferred cuisine:  │
  │  │ ○ South Indian (default)        │
  │  │ ○ North Indian                  │
  │  │ ○ Mixed Indian                  │
  │  └─────────────────────────────────┘
  │
  ├─ STEP 3: Click Generate ✓
  │  └─ Shows loading spinner
  │  └─ "AI is creating your diet plan..."
  │  └─ Wait 30-60 seconds
  │
  ├─ STEP 4: View Results ✓
  │  └─ 3 Variations displayed:
  │  │  1. Traditional [Cuisine]
  │  │  2. High-Protein [Cuisine]
  │  │  3. Light & Healthy [Cuisine]
  │
  ├─ STEP 5: View Details ✓
  │  └─ Day-wise breakdown
  │  └─ Breakfast, Lunch, Dinner, Snacks
  │  └─ Calories & Macros per meal
  │  └─ Portion sizes
  │
  └─ SUCCESS: Perfect personalized diet plan!
```

---

## 🧪 Testing Flow

```
TEST SCENARIO 1: South Indian
├─ Fill form
├─ Select: South Indian ✓
├─ Click Generate
└─ Verify:
   ├─ ✓ All dishes are South Indian
   ├─ ✓ Idli, Dosa, Sambar present
   ├─ ✓ NO Roti, Paratha, North dishes
   ├─ ✓ Uses Coconut/Sesame oil
   └─ ✓ Response shows "south-indian"

TEST SCENARIO 2: North Indian
├─ Fill form
├─ Select: North Indian ✓
├─ Click Generate
└─ Verify:
   ├─ ✓ All dishes are North Indian
   ├─ ✓ Roti, Dal, Paratha present
   ├─ ✓ NO Idli, Dosa, South dishes
   ├─ ✓ Uses Ghee/Mustard oil
   └─ ✓ Response shows "north-indian"

TEST SCENARIO 3: Mixed Indian
├─ Fill form
├─ Select: Mixed Indian ✓
├─ Click Generate
└─ Verify:
   ├─ ✓ Mix of South & North
   ├─ ✓ Variety throughout
   ├─ ✓ Different oils used
   ├─ ✓ Flexible combinations
   └─ ✓ Response shows "mixed-indian"

TEST SCENARIO 4: High-Protein Check
├─ For ANY cuisine
├─ Verify "High-Protein" variation
└─ Check:
   ├─ ✓ Protein 1.2-1.5g per kg
   ├─ ✓ High-protein items featured
   ├─ ✓ Daily total ~100-112g (for 75kg)
   └─ ✓ Proper macronutrient split

TEST SCENARIO 5: Light & Healthy Check
├─ For ANY cuisine
├─ Verify "Light & Healthy" variation
└─ Check:
   ├─ ✓ Steamed/boiled methods
   ├─ ✓ Minimal oil quantities
   ├─ ✓ Lower total calories
   └─ ✓ Light evening meals
```

---

## 🔧 Prompt Template Examples

### South Indian Prompt Template

```
"You are a South Indian nutritionist...
Create 7-day SOUTH INDIAN diet plan...

SOUTH INDIAN REQUIREMENTS:
- Focus: Rice, Millets, South Indian preparations
- NO Western food
- Cooking Oil: Coconut, Sesame, Groundnut
- Breakfast: Idli, Dosa, Upma, Pongal...
- Lunch: Rice with Sambar, Rasam, Kootu...
- Dinner: Idli, Kanji, Light Dosa...
- Snacks: Sundal, Makhana, Pori..."
```

### North Indian Prompt Template

```
"You are a North Indian nutritionist...
Create 7-day NORTH INDIAN diet plan...

NORTH INDIAN REQUIREMENTS:
- Focus: Wheat, Roti, Regional preparations
- Cooking Oil: Ghee, Mustard, Refined
- Breakfast: Paratha, Poha, Upma, Daliya...
- Lunch: Roti with Dal, Paneer, Aloo Gobi...
- Dinner: Light Roti, Khichdi...
- Snacks: Chickpea, Laddoos, Poha..."
```

---

## 📈 Performance Metrics

```
Response Generation Time
│
├─ South Indian:    30-60 seconds (3 variations)
├─ North Indian:    30-60 seconds (3 variations)
├─ Mixed Indian:    30-60 seconds (3 variations)
│
Response Size
├─ Per variation:   5-15 KB
├─ Total (3 vars):  20-50 KB
│
API Calls
├─ Gemini API:      3 calls per generation
├─ Rate limit:      60 calls/minute
│
Network Impact
├─ Bandwidth:       Minimal
├─ Latency:         No change
└─ Caching:         Not cached (fresh each time)
```

---

## ✅ Quality Checklist

### Before Deployment

- [ ] Frontend form shows cuisine dropdown
- [ ] Form validation includes cuisine field
- [ ] Backend accepts all 3 cuisine types
- [ ] Gemini prompts are cuisine-specific
- [ ] South Indian generates NO North Indian dishes
- [ ] North Indian generates NO South Indian dishes
- [ ] Mixed Indian shows variety
- [ ] High-Protein variation has high protein
- [ ] Light & Healthy variation has low oil
- [ ] Response includes cuisinePreference
- [ ] Error handling works correctly
- [ ] Documentation is complete
- [ ] Test guide is accurate

### Production Ready

- [ ] All tests pass
- [ ] No console errors
- [ ] API responses correct
- [ ] User feedback positive
- [ ] Performance acceptable
- [ ] Deployed successfully

---

**Last Updated:** December 7, 2025
**Status:** ✅ Ready to Deploy
**Version:** 1.0
