# Quick Workflow Reference - Frontend, Backend, LLMs

## 1️⃣ USER LOGIN

```
┌─────────────────────────────────────────┐
│ FRONTEND: Login Page (login.html)       │
│ User enters: email, password            │
└─────────────────┬───────────────────────┘
                  │ Fetch: POST /api/auth/login
                  │ Body: {email, password}
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: auth.controller.js             │
│ 1. Find user in MongoDB                 │
│ 2. Verify password (bcryptjs)           │
│ 3. Generate JWT token                   │
│ 4. Return {token, user}                 │
└─────────────────┬───────────────────────┘
                  │ Response with token
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Store & Redirect              │
│ localStorage.setItem('token', token)    │
│ Redirect to /pages/dashboard.html       │
└─────────────────────────────────────────┘
```

---

## 2️⃣ MEMBER VIEWS DASHBOARD

```
┌─────────────────────────────────────────┐
│ FRONTEND: dashboard.js                  │
│ 1. Check JWT token exists               │
│ 2. Connect to Socket.IO server          │
│ 3. Fetch progress data                  │
└─────────────────┬───────────────────────┘
                  │ GET /api/members/progress
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: member.controller.js           │
│ 1. Check Redis cache (5 min)            │
│    ✓ HIT: Return cached data (fast)     │
│    ✗ MISS: Query MongoDB                │
│ 2. Calculate stats:                     │
│    - Total workouts                     │
│    - Total calories                     │
│    - Total duration                     │
│ 3. Cache in Redis                       │
│ 4. Return data                          │
└─────────────────┬───────────────────────┘
                  │ Response: {stats}
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Display Stats                 │
│ - Total Workouts: 12                    │
│ - Calories Burned: 3,500 kcal           │
│ - Streak: 7 days                        │
│ - Goal Progress: 75%                    │
│                                          │
│ Listen for Socket.IO: progressUpdated   │
└─────────────────────────────────────────┘
```

---

## 3️⃣ MEMBER PERFORMS WORKOUT

```
┌─────────────────────────────────────────┐
│ FRONTEND: Muscle Workout (muscle-workout.html)
│ 1. Load GIFs from gif_database.js       │
│ 2. Fetch exercises (cached 24h)         │
│ 3. User selects muscle group            │
│ 4. Show exercises with GIFs             │
└─────────────────┬───────────────────────┘
                  │ User selects exercises
                  │ User starts workout
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Workout Execution (workout-execution.html)
│ 1. Display selected exercises           │
│ 2. User performs workout                │
│ 3. User inputs: Sets, Reps, Duration   │
│ 4. Calculate calories (formula)         │
└─────────────────┬───────────────────────┘
                  │ POST /api/workouts
                  │ Body: {exercises, duration, calories, ...}
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: workout.controller.js          │
│ 1. Verify JWT token                     │
│ 2. Save to MongoDB                      │
│ 3. Clear Redis caches:                  │
│    - user:${id}:progress (5m)           │
│    - user:${id}:workouts (5m)           │
│    - user:${id}:stats (10m)             │
│ 4. Calculate updated stats              │
│ 5. Emit Socket.IO: 'progressUpdated'    │
└─────────────────┬───────────────────────┘
                  │ Socket.IO real-time event
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Dashboard Listens             │
│ socket.on('progressUpdated', (data) => {│
│   updateDashboardStats(data);           │
│ });                                      │
│                                          │
│ ✨ Stats update instantly (< 100ms)     │
│ ✨ Animation plays                      │
│ ✨ NO PAGE REFRESH NEEDED               │
└─────────────────────────────────────────┘
```

---

## 4️⃣ MEMBER GETS AI WORKOUT SUGGESTIONS

```
┌─────────────────────────────────────────┐
│ FRONTEND: AI Suggestions Page           │
│ User fills form:                        │
│ - Age, Weight, Height                   │
│ - Fitness Level, Goals                  │
│ - Medical Conditions                    │
└─────────────────┬───────────────────────┘
                  │ POST /api/ai-suggestions/generate
                  │ Body: {userData}
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: ai-suggestion.controller.js    │
│ 1. Validate user data                   │
│ 2. Create detailed prompt for Gemini:   │
│    "You are a certified personal..."    │
│    "User: 25yo, 75kg, intermediate..."  │
│    "Generate 7 personalized exercises..."
│ 3. Call Gemini API (async)              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ GEMINI API (Google LLM)                 │
│ Model: gemini-1.5-flash                 │
│ Temperature: 0.7                        │
│ Max tokens: 2048                        │
│                                          │
│ Processes:                              │
│ 1. Analyzes user fitness level          │
│ 2. Considers goals & restrictions       │
│ 3. Generates personalized content:      │
│    - 7 specific exercises               │
│    - Sets, reps, duration               │
│    - Progressive overload plan          │
│    - Warm-up & cool-down tips           │
│    - Injury prevention tips             │
└─────────────────┬───────────────────────┘
                  │ Return formatted text
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND:                                │
│ 1. Receive Gemini response              │
│ 2. Format nicely                        │
│ 3. Optionally save to MongoDB (history) │
│ 4. Return to frontend                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Display Beautiful UI          │
│ - Workout plan with formatting          │
│ - Exercise cards with details           │
│ - Save/Share/Print options              │
│                                          │
│ ✨ User sees personalized workout!      │
└─────────────────────────────────────────┘
```

---

## 5️⃣ MEMBER GETS AI DIET PLAN

```
┌─────────────────────────────────────────┐
│ FRONTEND: Diet Plan Page                │
│ User fills form:                        │
│ - Current Weight, Target Weight         │
│ - Height, Age                           │
│ - Fitness Level, Goals                  │
│ - Dietary Restrictions                  │
└─────────────────┬───────────────────────┘
                  │ POST /api/diet-plan/generate
                  │ Body: {userData}
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: diet-plan.controller.js        │
│ 1. Validate data                        │
│ 2. Create South Indian diet prompt:     │
│    "You are a South Indian nutritionist"│
│    "Create 7-day South Indian diet..."  │
│    "Include: Idli, Dosa, Sambar, Dal..." │
│ 3. Call Gemini API                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ GEMINI API                              │
│ Generates:                              │
│ - 7-day South Indian meal plan          │
│ - Day-wise breakfast, lunch, dinner     │
│ - Snack options                         │
│ - Calorie counts per meal               │
│ - Macronutrient breakdown               │
│ - Portion sizes                         │
│ - Traditional recipes                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: Format & Return                │
│ HTML formatted response with:           │
│ - Day headers                           │
│ - Meal sections                         │
│ - Recipe cards                          │
│ - Nutritional info                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Display Diet Plan             │
│ Beautiful card layout:                  │
│ - Day 1: Breakfast, Lunch, Dinner       │
│ - Day 2: ...                            │
│ - Shopping list                         │
│ - Nutritional summary                   │
│                                          │
│ ✨ Member has personalized diet!        │
└─────────────────────────────────────────┘
```

---

## 6️⃣ TRAINER MONITORS CLIENT

```
┌─────────────────────────────────────────┐
│ FRONTEND: Trainer Dashboard             │
│ 1. Trainer logs in                      │
│ 2. Sees assigned clients list           │
│ 3. Clicks on client                     │
└─────────────────┬───────────────────────┘
                  │ GET /api/trainers/clients
                  ▼
┌─────────────────────────────────────────┐
│ BACKEND: trainer.controller.js          │
│ 1. Get trainer's assigned clients       │
│ 2. For each client:                     │
│    - Get recent workouts (cached 5m)    │
│    - Calculate progress                 │
│    - Check streak                       │
│ 3. Return formatted data                │
└─────────────────┬───────────────────────┘
                  │ Response: {clients}
                  ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Display Client List           │
│ Client Cards showing:                   │
│ - Name, Photo                           │
│ - Recent workouts                       │
│ - Progress stats                        │
│ - Last activity                         │
│                                          │
│ When client saves workout:              │
│ ✨ Card updates via Socket.IO           │
│ ✨ Trainer sees instantly               │
│ ✨ NO manual refresh                    │
└─────────────────────────────────────────┘
```

---

## 7️⃣ CACHING STRATEGY

```
DATA TYPE              | TTL      | WHEN CLEARED
───────────────────────┼──────────┼──────────────────────
User Progress          | 5 min    | On workout save/delete
User Workouts List     | 5 min    | On workout create/delete
User Stats             | 10 min   | On workout create/delete
All Exercises          | 24 hours | Manual (rare changes)
Single Exercise        | 24 hours | Manual
Muscle Group Filter    | 24 hours | Manual
Trainer Clients        | 5 min    | On client assignment
```

**Cache Check Flow:**

```
Request: GET /api/members/progress
    ↓
1️⃣  Check Redis: "user:123:progress"
    ├─ FOUND (HIT):   Return cached data (FAST ⚡)
    └─ NOT FOUND (MISS):
        2️⃣  Query MongoDB
        3️⃣  Calculate stats
        4️⃣  Save to Redis (5 min TTL)
        5️⃣  Return data
```

---

## 8️⃣ REAL-TIME ARCHITECTURE

```
REAL-TIME FLOW:
──────────────

Workout Saved
    ↓
emit('progressUpdated', data)
    ↓
WebSocket Message (< 100ms)
    ↓
Dashboard Receives
    ↓
DOM Update
    ↓
✨ User Sees Update (NO REFRESH)


WITHOUT REAL-TIME:
─────────────────
Save Workout
    ↓
Wait for database
    ↓
Manual refresh (⏱️ 2-5 seconds)
    ↓
Fetch from database
    ↓
✗ Slow, boring experience
```

---

## 9️⃣ AUTHENTICATION FLOW

```
┌──────────────────────────────────────┐
│ JWT Token Structure                  │
├──────────────────────────────────────┤
│ Header:   {alg: "HS256"}             │
│ Payload:  {userId, role, email}      │
│ Signature: HMAC-SHA256               │
│ Expires:  30 days                    │
└──────────────────────────────────────┘

EVERY REQUEST:
Request Header: Authorization: Bearer <JWT>
    ↓
Middleware: Verify JWT
    ├─ Valid:   Extract user ID, proceed
    └─ Invalid: Return 401 Unauthorized

LOGOUT:
Frontend: localStorage.removeItem('token')
NO server-side logout needed (stateless)
```

---

## 🔟 GEMINI API INTEGRATION

```
PROMPT STRUCTURE:
─────────────────
System Prompt:   "You are a certified personal trainer..."
User Data:       {age, weight, height, goals, restrictions}
Constraints:     Temperature 0.7, Max 2048 tokens

GEMINI RETURNS:
───────────────
- Natural language text
- Formatted with headers
- Includes exercises, meals, tips
- Personalized to user

BACKEND DOES:
─────────────
1. Validate input
2. Build comprehensive prompt
3. Call API (30-60 seconds)
4. Parse response
5. Format for display
6. Return to frontend

COST:
────
- Free tier: 60 requests/minute
- Paid: ~$0.075 per 1M tokens
- Efficient with caching
```

---

## KEY NUMBERS

| Metric                        | Value         |
| ----------------------------- | ------------- |
| JWT Token Lifetime            | 30 days       |
| Redis Cache TTL (Progress)    | 5 minutes     |
| Redis Cache TTL (Exercises)   | 24 hours      |
| Socket.IO Latency             | < 100ms       |
| Database Query Time           | 50-200ms      |
| Redis Query Time              | < 10ms        |
| Gemini API Response           | 30-60 seconds |
| Frontend Load Time (cached)   | ~50ms         |
| Frontend Load Time (no cache) | ~500ms        |
| Improvement with Cache        | 10x faster    |

---

## DEPLOYMENT CHECKLIST

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5174
- [ ] Redis running on port 6379
- [ ] MongoDB Atlas connected
- [ ] Gemini API key configured
- [ ] CORS enabled on backend
- [ ] Socket.IO connected
- [ ] JWT tokens valid
- [ ] Caching working (Redis)
- [ ] Real-time updates (Socket.IO)

---

This workflow provides a complete understanding of how all components work together!
