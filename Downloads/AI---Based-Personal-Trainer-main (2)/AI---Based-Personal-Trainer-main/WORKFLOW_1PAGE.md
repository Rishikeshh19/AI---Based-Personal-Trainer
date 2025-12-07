# AI Personal Trainer - 1 Page Workflow

## System Architecture

```
FRONTEND (Vite) ←→ BACKEND (Express) ←→ DATABASE (MongoDB)
   ↓                    ↓                      ↓
Socket.IO          Redis Cache            Gemini LLM
```

## Core Workflows

### 1. USER LOGIN

```
User: Enter email/password
  → POST /api/auth/login
  → Backend: Verify credentials
  → Return: JWT Token (30-day)
  → Frontend: Store in localStorage
  → Redirect: Dashboard
```

### 2. MEMBER DASHBOARD

```
Member views stats (Real-time)
  → GET /api/members/progress
  → Backend checks Redis cache (5 min TTL)
    - Cache HIT: Return instantly (10ms) ⚡
    - Cache MISS: Query MongoDB, cache result
  → Socket.IO listens for updates
  → When workout saved → Dashboard updates live (<100ms)
```

### 3. PERFORM WORKOUT

```
Member selects exercises (cached 24h)
  → Performs workout
  → Input: Sets, Reps, Duration
  → POST /api/workouts
  → Backend:
    - Save to MongoDB
    - Clear Redis cache (user progress)
    - Calculate new stats
    - Emit Socket.IO 'progressUpdated'
  → Frontend: Dashboard updates instantly
```

### 4. AI WORKOUT SUGGESTIONS

```
Member fills fitness form
  → POST /api/ai-suggestions/generate
  → Backend: Build detailed prompt
  → Call Gemini API (gemini-1.5-flash)
  → Gemini generates personalized plan:
    - 7 exercises specific to user
    - Sets, reps, duration
    - Progressive overload tips
    - Injury prevention notes
  → Return formatted to frontend
  → Display beautiful UI
```

### 5. AI DIET PLAN (Cuisine Preference)

```
Member fills nutrition form
  → SELECT cuisine preference:
    - South Indian (Idli, Dosa, Sambar)
    - North Indian (Roti, Dal, Curry)
    - Mixed Indian (Combination)
  → POST /api/diet-plan/generate
  → Backend: Build cuisine-specific diet prompt
  → Call Gemini API (3 variations per cuisine)
  → Gemini generates:
    - 7-day meal plan (cuisine-matched)
    - Breakfast, Lunch, Dinner per day
    - Calorie counts & macros
    - Recipe suggestions
    - Culturally authentic dishes
  → Return 3 variations to frontend
  → Display with cuisine-specific details
```

### 6. TRAINER MONITORS CLIENTS

```
Trainer logs in
  → GET /api/trainers/clients
  → Backend: Fetch assigned clients + their stats
  → Display client cards with:
    - Recent workouts
    - Progress stats
    - Last activity
  → When client saves workout:
    - Socket.IO sends update
    - Trainer sees instantly (no refresh)
```

## Performance Metrics

| Operation          | Time     | Method                     |
| ------------------ | -------- | -------------------------- |
| Dashboard (cached) | ~50ms    | Redis + Socket.IO          |
| Dashboard (fresh)  | ~500ms   | MongoDB query              |
| Exercises fetch    | ~10ms    | Redis cache (24h)          |
| Workout save       | ~200ms   | MongoDB + Redis invalidate |
| Real-time update   | <100ms   | WebSocket                  |
| AI suggestions     | 30-60s   | Gemini API                 |
| DB query           | 50-200ms | MongoDB                    |

## Caching Strategy

```
CACHE TYPE          TTL         CLEARED ON
─────────────────────────────────────────────
User Progress       5 min       Workout save
User Workouts       5 min       New workout
User Stats          10 min      Activity update
All Exercises       24 hours    Manual (rare)
Trainer Clients     5 min       Assignment change
```

## Authentication

```
Every request includes: Authorization: Bearer <JWT>
Backend middleware verifies token
- Valid: Extract user ID, proceed
- Invalid: Return 401 Unauthorized

Logout: Delete localStorage token (stateless)
```

## Real-Time Updates

```
WITHOUT Socket.IO:  Save → Wait → Manual refresh → 2-5 seconds
WITH Socket.IO:     Save → Instant → Dashboard update → <100ms

Frontend listens: socket.on('progressUpdated', updateDashboard)
Backend emits: socket.emit('progressUpdated', newStats)
```

## Tech Stack

- **Frontend:** Vite, Vanilla JS, TailwindCSS, Socket.IO Client
- **Backend:** Node.js, Express, JWT, Socket.IO Server
- **Database:** MongoDB Atlas
- **Cache:** Redis (5-24h TTL)
- **AI/LLM:** Google Gemini 1.5 Flash API
- **Real-Time:** WebSockets (Socket.IO)
- **Ports:** Frontend 5174, Backend 8000, Redis 6379

## Deployment Checklist

- ✅ Backend running on :8000
- ✅ Frontend running on :5174
- ✅ Redis running on :6379
- ✅ MongoDB Atlas connected
- ✅ Gemini API key configured
- ✅ Socket.IO connected
- ✅ CORS enabled
- ✅ JWT tokens working
- ✅ Redis caching active
- ✅ Real-time updates live

## Key Decisions

1. **South Indian Diet Focus:** Specialized prompts for regional cuisine
2. **Redis Caching:** 10x performance improvement on dashboard
3. **Socket.IO Real-Time:** Instant updates without page refresh
4. **JWT Auth:** Stateless, scalable authentication
5. **Gemini LLM:** Personalized AI suggestions with safety guidelines
6. **Member Diet Access:** Removed trainer-only restriction (all members can generate)

---

**Status:** ✅ Production Ready | **Last Updated:** Dec 7, 2025
