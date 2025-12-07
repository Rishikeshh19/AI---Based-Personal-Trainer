# AI Personal Trainer - Complete Workflow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │Dashboard │  │ Workouts │  │AI Feature│
            │  (Member)│  │ & Muscle │  │ (Diet,   │
            │ (Trainer)│  │ Workouts │  │Suggestions)
            └──────────┘  └──────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  FRONTEND (Vite)  │
                    │  - HTML/CSS/JS    │
                    │  - Socket.IO      │
                    │  - Local Storage  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   HTTP/WebSocket  │
                    │   REST API + WS   │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        ┌──────────┐  ┌──────────────┐  ┌──────────┐
        │ Backend  │  │   Socket.IO  │  │  Redis   │
        │(Express) │◄─┤  (Real-time) │─►│ (Cache)  │
        │ - Routes │  │              │  │          │
        │ - Auth   │  └──────────────┘  └──────────┘
        │ - Logic  │
        └────┬─────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌────────┐ ┌──────────────┐ ┌──────────┐
│MongoDB │ │ Gemini API   │ │ Nodemailer
│(Database)│(LLM/AI)       │ │(Email)   │
└────────┘ └──────────────┘ └──────────┘
```

---

## 1. FRONTEND ARCHITECTURE

### 1.1 Tech Stack

- **Framework:** Vite (development server)
- **Language:** Vanilla JavaScript
- **Styling:** TailwindCSS + Custom CSS
- **Real-time:** Socket.IO Client
- **Storage:** LocalStorage (tokens, user data)
- **HTTP:** Fetch API

### 1.2 Key Frontend Files

#### Authentication Flow (`js/auth.js`)

```
User Input (Login/Signup)
    ↓
Fetch: POST /api/auth/login
    ↓
Receive: JWT Token + User Data
    ↓
localStorage.setItem('token', token)
localStorage.setItem('user', userData)
    ↓
Redirect to Dashboard
```

#### Dashboard Page (`pages/dashboard.html` + `js/dashboard.js`)

```
Page Load
    ↓
Check localStorage for token
    ↓
Connect to Socket.IO Server
    ↓
Fetch: GET /api/members/progress
    ↓
Display Stats (Workouts, Calories, Streak)
    ↓
Listen for Socket.IO Event: 'progressUpdated'
    ↓
When event received → Update stats instantly
    ↓
Fallback: Refresh every 30 seconds
```

#### Muscle Workout Page (`pages/muscle-workout.html` + `js/exercises.js`)

```
Page Load
    ↓
Load: js/gif_database.js (38 GIFs as Base64)
    ↓
Fetch: GET /api/exercises (cached 24 hours)
    ↓
Display Muscle Groups
    ↓
User selects muscle → Filter exercises
    ↓
Display GIFs for selected exercises
    ↓
User selects exercises → Start Workout
    ↓
Redirect to: /pages/workout-execution.html
```

#### Workout Execution (`pages/workout-execution.html` + `js/workout.js`)

```
Display selected exercises
    ↓
User performs workout
    ↓
User inputs: Sets, Reps, Duration, Notes
    ↓
Calculate Calories (basic formula)
    ↓
Submit: POST /api/workouts
    ↓
Backend saves workout
    ↓
Socket.IO emits: 'progressUpdated'
    ↓
Dashboard auto-updates (real-time)
    ↓
Show success message
```

#### AI Features (`pages/ai-suggestions.html` + `pages/diet-plan.html`)

```
User fills form with:
  - Current weight, target weight
  - Height, age, fitness level
  - Goals, dietary restrictions
    ↓
Submit: POST /api/ai-suggestions/generate
        POST /api/diet-plan/generate
    ↓
Frontend shows loading spinner
    ↓
Backend calls Gemini API
    ↓
Gemini generates personalized plan
    ↓
Backend returns formatted response
    ↓
Frontend displays in readable format
```

### 1.3 Socket.IO Connection

```javascript
// Connect on page load
socket = io("http://localhost:8000", {
  auth: { token: localStorage.getItem("token") },
  reconnection: true,
});

// Listen for real-time updates
socket.on("progressUpdated", (data) => {
  updateDashboardStats(data);
});

// Join user's progress room
socket.emit("joinProgressRoom", userId);
```

---

## 2. BACKEND ARCHITECTURE

### 2.1 Tech Stack

- **Framework:** Express.js (Node.js)
- **Real-time:** Socket.IO
- **Database:** MongoDB (Atlas)
- **Caching:** Redis
- **AI/LLM:** Google Gemini API
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer

### 2.2 Backend Flow - Request Lifecycle

#### Authentication Route

```
POST /api/auth/login
    ↓
1. Validate email & password format
    ↓
2. Query MongoDB: Find user by email
    ↓
3. Compare password: bcryptjs.compare()
    ↓
4. Generate JWT token (valid 30 days)
    ↓
5. Return: { token, user, success: true }
    ↓
Frontend stores token in localStorage
```

#### Member Progress Route (With Caching)

```
GET /api/members/progress
    ↓
1. Check Redis cache: "user:${userId}:progress"
    ↓
2. If Cache HIT → Return cached data (5 min old)
    ↓
2. If Cache MISS:
       a. Query MongoDB (last 30 days workouts)
       b. Calculate stats: totalWorkouts, calories, duration
       c. Store in Redis: 5 minute TTL
       d. Return fresh data
    ↓
Response includes: source (cache/database)
```

#### Workout Creation Route (With Real-Time Update)

```
POST /api/workouts
    ↓
1. Verify JWT token is valid
    ↓
2. Extract user ID from token
    ↓
3. Validate workout data (exercises, duration, calories)
    ↓
4. Save to MongoDB
    ↓
5. Clear related Redis caches:
    - user:${userId}:progress
    - user:${userId}:workouts
    - user:${userId}:stats
    ↓
6. Emit Socket.IO event:
    io.to(`progress:${userId}`).emit('progressUpdated', stats)
    ↓
7. Return: { success: true, data: workout }
    ↓
Frontend receives Socket.IO event
    ↓
Dashboard updates stats instantly (< 100ms)
```

#### Exercise Route (24-Hour Cache)

```
GET /api/exercises
    ↓
1. Check Redis cache: "exercises:all"
    ↓
2. If Cache HIT → Return 38 exercises (fast)
    ↓
2. If Cache MISS:
       a. Query MongoDB: Exercise collection
       b. Cache for 24 hours (exercises rarely change)
       c. Return data
    ↓
GET /api/exercises/muscle/:muscleGroup
    ↓
1. Check Redis: "exercises:muscle:${group}"
    ↓
2. Filter exercises by muscle group
    ↓
3. Cache for 24 hours
```

### 2.3 Middleware Stack

```
Express Server
    ↓
CORS Middleware (allow frontend domain)
    ↓
Body Parser (JSON up to 50MB for GIFs)
    ↓
Authentication Middleware (verify JWT)
    ↓
Route Handler
    ↓
Redis Cache Service (get/set/delete)
    ↓
MongoDB Operation
    ↓
Socket.IO Event Emission
    ↓
Response to Frontend
```

### 2.4 Database Schema (MongoDB)

#### User Collection

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String (member/trainer),
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    height: Number,
    weight: Number,
    fitnessLevel: String,
    goals: [String],
    bio: String
  },
  trainerId: ObjectId (ref to Trainer),
  assignedClients: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

#### Workout Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref to User),
  date: Date,
  exercises: [{
    name: String,
    duration: Number,
    sets: Number,
    reps: Number,
    weight: Number
  }],
  totalDuration: Number,
  totalCalories: Number,
  intensity: String (low/moderate/high),
  mood: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Exercise Collection

```javascript
{
  _id: ObjectId,
  name: String,
  muscleGroup: String,
  description: String,
  difficulty: String,
  gifUrl: String (Base64 data URL),
  caloriesBurned: Number,
  createdAt: Date
}
```

---

## 3. LLM INTEGRATION (Google Gemini API)

### 3.1 Architecture

```
Frontend User Request
    ↓
POST /api/ai-suggestions/generate
POST /api/diet-plan/generate
    ↓
Backend: Prepare Prompt
    ↓
Call Gemini API:
  - Model: gemini-1.5-flash
  - Temperature: 0.7
  - Max tokens: 2048
    ↓
Gemini Processes:
  - Analyzes user profile
  - Generates personalized recommendations
  - Considers fitness level, goals, restrictions
    ↓
Return formatted response
    ↓
Backend caches/stores in MongoDB
    ↓
Send to Frontend
    ↓
Display formatted text/markdown
```

### 3.2 AI Suggestion Prompt

```
SYSTEM PROMPT:
"You are a certified personal trainer with 10+ years of experience"

USER DATA SENT:
{
  age: 25,
  weight: 75,
  height: 175,
  fitnessLevel: "intermediate",
  goals: ["Weight Loss", "Muscle Gain"],
  medicalConditions: "None",
  recentWorkouts: [...]
}

GEMINI RESPONSE:
1. 5-7 specific exercise recommendations
2. Sets, reps, duration for each
3. Weekly workout schedule
4. Warm-up & cool-down tips
5. Progression guidelines
```

### 3.3 Diet Plan Generation

```
SYSTEM PROMPT:
"You are a professional South Indian nutritionist specializing
in traditional South Indian cuisine"

USER DATA:
{
  currentWeight: 75,
  targetWeight: 65,
  height: 175,
  age: 25,
  fitnessLevel: "intermediate",
  dietaryRestrictions: "Vegetarian"
}

GEMINI RETURNS:
- 7-day SOUTH INDIAN diet plan
- Meals: Breakfast, Lunch, Dinner, Snacks
- Calorie counts per meal
- Macronutrient breakdown
- Portion sizes in South Indian terms
- Sample recipes using dals, rice, vegetables
```

### 3.4 LLM Integration Files

**`backend/config/gemini.config.js`**

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateContent(prompt, config = {}) {
  const result = await model.generateContent(prompt, {
    generationConfig: config,
  });
  return result.response.text();
}
```

**`backend/controllers/ai-suggestion.controller.js`**

```javascript
exports.generateSuggestions = async (userData) => {
  const prompt = `You are a certified personal trainer...
    User Profile: ${JSON.stringify(userData)}
    Generate personalized workout suggestions...`;

  const suggestions = await geminiService.generateContent(prompt);
  return suggestions;
};
```

**`backend/controllers/diet-plan.controller.js`**

```javascript
exports.generateDietPlan = async (userData) => {
  const prompt = `You are a South Indian nutritionist...
    User Profile: ${JSON.stringify(userData)}
    Create a detailed 7-day South Indian diet plan...`;

  const dietPlan = await geminiService.generateContent(prompt);
  return dietPlan;
};
```

---

## 4. REAL-TIME UPDATES (Socket.IO + Redis)

### 4.1 Flow

```
Member saves workout
    ↓
POST /api/workouts
    ↓
Backend:
  1. Save to MongoDB
  2. Clear Redis cache
  3. Calculate new stats
  4. Emit Socket.IO event
    ↓
io.to(`progress:${userId}`).emit('progressUpdated', {
    totalWorkouts: 12,
    totalCalories: 3500,
    totalDuration: 600
})
    ↓
Frontend (Dashboard):
  1. Receives event via Socket.IO
  2. Updates DOM elements
  3. Plays animation
  4. No page refresh needed
    ↓
UPDATE VISIBLE TO USER IN < 100ms
```

### 4.2 Cache Strategy

```
Data Type           | TTL      | Invalidation
────────────────────┼──────────┼─────────────────────
Progress Stats      | 5 min    | On workout change
Workouts List       | 5 min    | On workout create/delete
User Stats          | 10 min   | On workout change
All Exercises       | 24 hours | Manual (rarely changes)
Single Exercise     | 24 hours | Manual
Muscle Group Filter | 24 hours | Manual
```

---

## 5. COMPLETE USER JOURNEY

### 5.1 New User Registration

```
FRONTEND:
1. User visits: http://localhost:5174
2. Clicks "Sign Up"
3. Fills form: username, email, password, role
4. Submits form

BACKEND:
1. Validates input
2. Checks email not duplicate
3. Hashes password with bcryptjs
4. Creates user in MongoDB
5. Generates JWT token
6. Returns: { token, user, success: true }

FRONTEND:
1. Stores token in localStorage
2. Stores user data
3. Redirects to Dashboard

RESULT:
- User can now access all features
- Token valid for 30 days
```

### 5.2 Member Completes Workout

```
FRONTEND:
1. Member: Dashboard page (sees stats)
2. Clicks: "Muscle Workout"
3. Selects muscle group (e.g., Chest)
4. Sees exercises with GIFs (from cache)
5. Selects exercises
6. Clicks "Start Workout"
7. Performs exercises, enters:
   - Sets: 3
   - Reps: 10
   - Duration: 45 minutes
   - Notes: "Felt good"
8. Clicks "Save Workout"

BACKEND:
1. Validates workout data
2. Saves to MongoDB
3. Clears Redis caches
4. Calculates stats:
   - Total workouts: 12
   - Total calories: 3500
   - Total duration: 600 min
5. Emits Socket.IO: 'progressUpdated'

FRONTEND (Dashboard Tab):
1. Receives Socket.IO event
2. Updates stats instantly
3. Animation plays
4. No page refresh

RESULT:
- Workout saved ✓
- Dashboard updated real-time ✓
- Progress visible to trainer ✓
```

### 5.3 Trainer Monitors Client

```
TRAINER FRONTEND:
1. Logs in with trainer account
2. Visits: Trainer Dashboard
3. Views assigned clients

BACKEND:
1. Fetch: GET /api/trainers/clients
2. Get client list from MongoDB
3. For each client, fetch recent workouts
4. Cache for 5 minutes

FRONTEND:
1. Displays client list
2. Shows client progress
3. Can send messages
4. Can view detailed workout history

REAL-TIME:
- When client saves workout
- Trainer dashboard updates via Socket.IO
- Trainer sees updates without refreshing
```

### 5.4 Member Gets AI Suggestions

```
FRONTEND:
1. Member: Dashboard → "AI Suggestions"
2. Fills form:
   - Age: 25
   - Weight: 75 kg
   - Height: 175 cm
   - Fitness Level: Intermediate
   - Goals: Weight Loss, Muscle Gain
3. Clicks "Generate"
4. Shows loading spinner

BACKEND:
1. Validates input
2. Creates prompt for Gemini
3. Calls Gemini API (async)
4. Gemini processes:
   - Analyzes fitness level
   - Considers goals
   - Checks medical conditions
   - Generates 7 personalized exercises
5. Returns formatted response
6. Stores in MongoDB for history

FRONTEND:
1. Receives HTML-formatted response
2. Displays with nice formatting
3. User can save/share

RESULT:
- Personalized suggestions ✓
- Based on user profile ✓
- AI-powered (Gemini) ✓
```

---

## 6. DATA FLOW DIAGRAMS

### 6.1 Authentication Flow

```
┌──────────────┐
│    Frontend  │
│   Login Form │
└──────┬───────┘
       │ POST /api/auth/login
       │ { email, password }
       ▼
┌──────────────────────────┐
│   Backend Express App     │
│  - Validate credentials   │
│  - Query MongoDB          │
│  - Compare passwords      │
│  - Generate JWT token     │
└──────┬───────────────────┘
       │ Return JWT + User
       ▼
┌──────────────┐
│   Frontend   │
│ localStorage │ ◄─── Store token
│   + Redirect │
└──────────────┘
```

### 6.2 Workout Submission Flow

```
┌─────────────────────┐
│ Frontend Workout    │
│ Execution Page      │
└────────┬────────────┘
         │ User submits
         │ workout form
         ▼
┌─────────────────────────────┐
│ POST /api/workouts          │
│ (with JWT token)            │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Middleware           │
│ - Verify JWT token           │
│ - Extract user ID            │
│ - Validate data              │
└────────┬─────────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
    ┌─────────────────┐  ┌──────────────────┐
    │ MongoDB         │  │ Redis Cache      │
    │ Save workout    │  │ Clear caches:    │
    │ Record          │  │ - progress       │
    │                 │  │ - workouts       │
    │                 │  │ - stats          │
    └─────────────────┘  └──────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
    ┌──────────────────┐         ┌────────────────────┐
    │ Calculate Stats  │         │ Emit Socket.IO     │
    │ - Calories       │         │ 'progressUpdated'  │
    │ - Duration       │         │ event to user room │
    │ - Count          │         │                    │
    └──────────────────┘         └─────────┬──────────┘
         │                                  │
         └──────────────────┬───────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │ Frontend Dashboard      │
                │ Receives Socket.IO      │
                │ Updates stats instantly │
                │ NO PAGE REFRESH         │
                └─────────────────────────┘
```

### 6.3 AI Generation Flow

```
┌──────────────────────┐
│ Frontend AI Form     │
│ (Diet/Suggestions)   │
└──────────┬───────────┘
           │ User submits
           │ form data
           ▼
┌──────────────────────────────┐
│ POST /api/diet-plan/generate │
│ POST /api/ai-suggestions     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Backend Handler              │
│ - Validate user data         │
│ - Create Gemini prompt       │
│ - Show loading spinner       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Gemini API                   │
│ (Google's LLM)               │
│ - Processes prompt           │
│ - Generates content          │
│ - Returns formatted text     │
└──────────┬───────────────────┘
           │
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
       ┌─────────────┐        ┌──────────────┐
       │ MongoDB     │        │ Return to    │
       │ Store       │        │ Frontend     │
       │ History     │        │ (Formatted)  │
       └─────────────┘        └──────┬───────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Frontend Display │
                            │ Beautiful UI     │
                            │ with formatting  │
                            └──────────────────┘
```

---

## 7. ENVIRONMENT & CONFIGURATION

### 7.1 Environment Variables

**Backend (.env)**

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# API Keys
GEMINI_API_KEY=your-gemini-api-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server
PORT=8000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:5174
```

**Frontend (vite.config.js)**

```javascript
export default {
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
};
```

---

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Production Setup

```
┌─────────────────────────────────────────┐
│         Client Browser                  │
│         http://app.com                  │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌────────┐  ┌──────────────┐
    │Frontend│  │ Static Files │
    │(CDN)   │  │ (CSS/JS/GIFs)│
    └─┬──────┘  └──────────────┘
      │
      ▼
┌──────────────────────────────────┐
│    Load Balancer / Nginx         │
│    HTTPS, Compression            │
└──────────────┬───────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Backend      │  │ Backend      │
│ Instance 1   │  │ Instance 2   │
│ (Express)    │  │ (Express)    │
└──────┬───────┘  └───────┬──────┘
       │                  │
       └────────┬─────────┘
                ▼
      ┌──────────────────────┐
      │  Redis Cache         │
      │  (Distributed)       │
      └──────┬───────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  MongoDB     │  │ Gemini API   │
│  (Cloud)     │  │ (Google)     │
└──────────────┘  └──────────────┘
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Frontend Optimization

- ✅ Code splitting (Vite)
- ✅ Image compression (Base64 GIFs)
- ✅ LocalStorage caching
- ✅ Socket.IO for real-time (no polling)
- ✅ Lazy loading pages

### 9.2 Backend Optimization

- ✅ Redis caching (5-24 hour TTL)
- ✅ Database indexing (MongoDB)
- ✅ Connection pooling
- ✅ Async/await (non-blocking)
- ✅ Compression middleware

### 9.3 Database Optimization

- ✅ Indexed queries (.user, .date)
- ✅ Lean queries (exclude \_\_v)
- ✅ Pagination for large datasets
- ✅ Aggregation pipelines for stats

---

## 10. MONITORING & LOGGING

### 10.1 Backend Logs

```
✓ Redis client connected
🚀 Server running on port 8000
Socket.IO is running on ws://localhost:8000

Cache HIT: user:123:progress (5m TTL)
Cache MISS: user:456:stats (querying DB)
Progress update emitted for user: 789
Gemini API called for diet plan generation
Workout saved: 507f1f77bcf86cd799439011
```

### 10.2 Frontend Console

```
✓ Connected to Socket.IO server
User joined room: progress:userId
Real-time progress update received
Cache HIT: exercises (24h)
Workout submitted successfully
```

---

## Summary

This architecture provides:

- ✅ **Real-time updates** via Socket.IO
- ✅ **Fast responses** via Redis caching
- ✅ **AI-powered features** via Gemini API
- ✅ **Scalable backend** with Express.js
- ✅ **Responsive frontend** with Vite
- ✅ **Persistent storage** with MongoDB
- ✅ **Secure authentication** with JWT
- ✅ **Email support** with Nodemailer

**Performance**: 10-50x faster with caching, <100ms real-time updates
